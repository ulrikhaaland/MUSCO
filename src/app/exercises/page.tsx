'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import ExerciseCard from '../components/ui/ExerciseCard';
import { Exercise } from '../types/program';
import { exerciseFiles, loadExercisesFromJson } from '../services/exerciseProgramService';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { searchYouTubeVideo } from '../utils/youtube';
import Chip from '../components/ui/Chip';
import { useTranslation } from '../i18n/TranslationContext';

interface BodyPartExercises {
  [bodyPart: string]: Exercise[];
}

// Helper functions for video URL handling
function isYouTubeUrl(url: string): boolean {
  const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  return youtubeRegExp.test(url);
}

function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com') || url.includes('player.vimeo.com');
}

function isFirebaseStorageUrl(url: string): boolean {
  return url.startsWith('gs://');
}

function getVideoEmbedUrl(url: string): string {
  // YouTube URL handling
  const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const youtubeMatch = url.match(youtubeRegExp);

  if (youtubeMatch && youtubeMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${youtubeMatch[2]}`;
  }
  
  // For non-YouTube URLs, return as is
  return url;
}

export default function AvailableExercisesPage() {
  const [exercisesByBodyPart, setExercisesByBodyPart] = useState<BodyPartExercises>({});
  const [expandedExercises, setExpandedExercises] = useState<{ [bodyPart: string]: string[] }>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMuscoExercises, setShowMuscoExercises] = useState<boolean>(true);
  const [allEquipment, setAllEquipment] = useState<string[]>([]);
  const [equipmentCounts, setEquipmentCounts] = useState<Record<string, number>>({});
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showAllEquipment, setShowAllEquipment] = useState(false);
  // Separate storage for Musco and original equipment counts
  const [muscoEquipmentData, setMuscoEquipmentData] = useState<{
    equipment: string[];
    counts: Record<string, number>;
  }>({ equipment: [], counts: {} });
  const [originalEquipmentData, setOriginalEquipmentData] = useState<{
    equipment: string[];
    counts: Record<string, number>;
  }>({ equipment: [], counts: {} });
  // Add video states
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);
  const [preloadedVideoUrls, setPreloadedVideoUrls] = useState<{ [key: string]: string }>({});

  // Refs for category sections to enable scrolling
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const { locale } = useTranslation();

  // Load exercises on component mount
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const bodyParts = Object.keys(exerciseFiles());
        
        // For the toggle feature, we need both Musco and original exercises
        const loaded = await loadExercisesFromJson(bodyParts, true, false, locale === 'nb');
        
        // Separate Musco and original exercises
        const muscoExercises = loaded.filter(ex => 
          ex.videoUrl?.includes('musco-dc111.firebasestorage.app') || 
          (ex.isOriginal === false) ||
          ex.id?.startsWith('m_') || 
          ex.videoUrl?.includes('/musco/') ||
          ex.id?.includes('musco')
        );
        
        const originalExercises = loaded.filter(ex => ex.isOriginal === true);
        
        // Count and process equipment for Musco exercises
        const muscoEquipmentSet = new Set<string>();
        const muscoCountsMap: Record<string, number> = {};
        
        muscoExercises.forEach(exercise => {
          if (exercise.equipment && Array.isArray(exercise.equipment) && exercise.equipment.length > 0) {
            exercise.equipment.forEach(eq => {
              muscoEquipmentSet.add(eq);
              muscoCountsMap[eq] = (muscoCountsMap[eq] || 0) + 1;
            });
          }
        });
        
        // Count and process equipment for original exercises
        const originalEquipmentSet = new Set<string>();
        const originalCountsMap: Record<string, number> = {};
        
        originalExercises.forEach(exercise => {
          if (exercise.equipment && Array.isArray(exercise.equipment) && exercise.equipment.length > 0) {
            exercise.equipment.forEach(eq => {
              originalEquipmentSet.add(eq);
              originalCountsMap[eq] = (originalCountsMap[eq] || 0) + 1;
            });
          }
        });
        
        // Convert Sets to arrays sorted by occurrence count (descending)
        const muscoEquipment = Array.from(muscoEquipmentSet).sort((a, b) => 
          (muscoCountsMap[b] || 0) - (muscoCountsMap[a] || 0)
        );
        
        const originalEquipment = Array.from(originalEquipmentSet).sort((a, b) => 
          (originalCountsMap[b] || 0) - (originalCountsMap[a] || 0)
        );
        
        // Store in state
        setMuscoEquipmentData({
          equipment: muscoEquipment,
          counts: muscoCountsMap
        });
        
        setOriginalEquipmentData({
          equipment: originalEquipment,
          counts: originalCountsMap
        });
        
        // Set current equipment data based on toggle
        if (showMuscoExercises) {
          setAllEquipment(muscoEquipment);
          setEquipmentCounts(muscoCountsMap);
        } else {
          setAllEquipment(originalEquipment);
          setEquipmentCounts(originalCountsMap);
        }
        
        // Debug info
        console.log(`Total exercises loaded: ${loaded.length}`);
        console.log(`Musco exercises: ${muscoExercises.length}, Original exercises: ${originalExercises.length}`);
        console.log(`Musco equipment types: ${muscoEquipment.length}, Original equipment types: ${originalEquipment.length}`);
        
        // Count exercises for each type
        const muscoCount = muscoExercises.length;
        const originalCount = originalExercises.length;
        
        console.log(`Musco exercises: ${muscoCount}, Original exercises: ${originalCount}`);
        
        // Filter exercises based on whether they're Musco or non-Musco
        const filteredBySource = loaded.filter(exercise => {
          // First check if explicitly marked as original or not
          if (exercise.isOriginal === true) {
            return !showMuscoExercises; // Show original exercises when NOT showing Musco exercises
          }
          
          if (exercise.isOriginal === false) {
            return showMuscoExercises; // Show non-original (Musco) exercises when showing Musco exercises
          }
          
          // If no isOriginal flag, use heuristics
          const isMusco = exercise.videoUrl?.includes('musco-dc111.firebasestorage.app') || 
                         exercise.id?.startsWith('m_') || 
                         exercise.videoUrl?.includes('/musco/') ||
                         exercise.id?.includes('musco');
                         
          // For debugging
          if (isMusco) {
            console.log('Detected Musco exercise by URL/ID pattern:', exercise.name, exercise.id, exercise.videoUrl);
          }
          
          return showMuscoExercises ? isMusco : !isMusco;
        });
        
        // Count exercises by category for debugging
        const exerciseCountByCategory: Record<string, { musco: number, original: number }> = {};

        // Log how many exercises we have after filtering
        console.log(`After filtering - showing ${showMuscoExercises ? 'Musco' : 'Original'} exercises, count: ${filteredBySource.length}`);

        // Look for Lower Back exercises specifically for debugging
        const lowerBackExercises = filteredBySource.filter(ex => 
          ex.id?.startsWith('lower-back-') || 
          ex.id?.startsWith('lower_back-') || 
          ex.muscles?.includes('Lower Back') ||
          ex.targetBodyParts?.includes('Lower Back')
        );
        console.log(`Found ${lowerBackExercises.length} Lower Back exercises after filtering`);

        // Group exercises by their specific categories
        const grouped: BodyPartExercises = {};

        // Map to convert from JSON filename to display categories
        const categoryMap: Record<string, string> = {
          'm_abs.json': 'Abs',
          'm_biceps.json': 'Biceps',
          'm_calves.json': 'Calves',
          'cardio.json': 'Cardio',
          'm_chest.json': 'Chest',
          'm_forearms.json': 'Forearms', 
          'm_glutes.json': 'Glutes',
          'm_hamstrings.json': 'Hamstrings',
          'm_lats.json': 'Lats',
          'm_lower-back.json': 'Lower Back',
          'm_obliques.json': 'Obliques',
          'm_quads.json': 'Quads',
          'm_shoulders.json': 'Shoulders',
          'm_traps.json': 'Traps',
          'm_triceps.json': 'Triceps',
          'm_upper-back.json': 'Upper Back',
          'warmups.json': 'Warmup'
        };

        // Initialize categories based on actual file structure
        Object.values(categoryMap).forEach(category => {
          grouped[category] = [];
          exerciseCountByCategory[category] = { musco: 0, original: 0 };
        });

        // Map exercises to their specific categories
        filteredBySource.forEach((ex) => {
          // Extract category from ID or name
          let category = null;
          const isOriginal = ex.isOriginal === true;
          
          // First check ID patterns which are most reliable
          if (ex.id) {
            // Check for specific ID patterns
            if (ex.id.startsWith('biceps-') || ex.id.includes('biceps')) category = 'Biceps';
            else if (ex.id.startsWith('triceps-') || ex.id.includes('triceps')) category = 'Triceps';
            else if (ex.id.startsWith('shoulders-') || ex.id.includes('shoulder')) category = 'Shoulders';
            else if (ex.id.startsWith('abs-') || ex.id.includes('abs')) category = 'Abs';
            else if (ex.id.startsWith('obliques-') || ex.id.includes('obliques')) category = 'Obliques';
            else if (ex.id.startsWith('glutes-') || ex.id.includes('glutes')) category = 'Glutes';
            else if (ex.id.startsWith('hamstrings-') || ex.id.includes('hamstrings')) category = 'Hamstrings';
            else if (ex.id.startsWith('quads-') || ex.id.includes('quads')) category = 'Quads';
            else if (ex.id.startsWith('calves-') || ex.id.includes('calves')) category = 'Calves';
            else if (ex.id.startsWith('chest-') || ex.id.includes('chest')) category = 'Chest';
            else if (ex.id.startsWith('forearms-') || ex.id.includes('forearm')) category = 'Forearms';
            else if (ex.id.startsWith('lats-') || ex.id.includes('lats')) category = 'Lats';
            else if (ex.id.startsWith('traps-') || ex.id.includes('traps')) category = 'Traps';
            else if (ex.id.startsWith('upper-back-') || ex.id.includes('upper_back') || ex.id.includes('upper-back')) category = 'Upper Back';
            else if (ex.id.startsWith('lower-back-') || ex.id.includes('lower_back') || ex.id.includes('lower-back')) {
              category = 'Lower Back';
              console.log('Found Lower Back exercise by ID:', ex.id, ex.name);
            }
            else if (ex.id.startsWith('cardio-') || ex.id.includes('cardio')) category = 'Cardio';
            else if (ex.id.startsWith('warmup-') || ex.id.includes('warmup') || ex.id.includes('warm-up')) category = 'Warmup';
          }
          
          // If we couldn't determine a category from ID, use the muscles array
          if (!category && ex.muscles?.length) {
            // Check first for specific muscles to assign to the right category
            if (ex.muscles.includes('Biceps')) category = 'Biceps';
            else if (ex.muscles.includes('Triceps')) category = 'Triceps';
            else if (ex.muscles.includes('Abs')) category = 'Abs';
            else if (ex.muscles.includes('Obliques')) category = 'Obliques';
            else if (ex.muscles.includes('Glutes')) category = 'Glutes';
            else if (ex.muscles.includes('Hamstrings')) category = 'Hamstrings';
            else if (ex.muscles.includes('Quads')) category = 'Quads';
            else if (ex.muscles.includes('Calves')) category = 'Calves';
            else if (ex.muscles.includes('Shoulders')) category = 'Shoulders';
            else if (ex.muscles.includes('Chest')) category = 'Chest';
            else if (ex.muscles.includes('Forearms')) category = 'Forearms';
            else if (ex.muscles.includes('Lats')) category = 'Lats';
            else if (ex.muscles.includes('Traps')) category = 'Traps';
            else if (ex.muscles.includes('Upper Back')) category = 'Upper Back';
            else if (ex.muscles.includes('Lower Back')) {
              category = 'Lower Back';
              console.log('Found Lower Back exercise by muscle:', ex.name);
            }
            else if (ex.muscles.includes('Cardio') || ex.muscles.includes('Cardiovascular')) category = 'Cardio';
          }
          
          // If still no category, check targetBodyParts
          if (!category && ex.targetBodyParts?.length) {
            if (ex.targetBodyParts.includes('Biceps')) category = 'Biceps';
            else if (ex.targetBodyParts.includes('Triceps')) category = 'Triceps';
            else if (ex.targetBodyParts.includes('Abs')) category = 'Abs';
            else if (ex.targetBodyParts.includes('Obliques')) category = 'Obliques';
            else if (ex.targetBodyParts.includes('Glutes')) category = 'Glutes';
            else if (ex.targetBodyParts.includes('Hamstrings')) category = 'Hamstrings';
            else if (ex.targetBodyParts.includes('Quads')) category = 'Quads';
            else if (ex.targetBodyParts.includes('Calves')) category = 'Calves';
            else if (ex.targetBodyParts.includes('Shoulders')) category = 'Shoulders';
            else if (ex.targetBodyParts.includes('Chest')) category = 'Chest';
            else if (ex.targetBodyParts.includes('Forearms')) category = 'Forearms';
            else if (ex.targetBodyParts.includes('Lats')) category = 'Lats';
            else if (ex.targetBodyParts.includes('Traps')) category = 'Traps';
            else if (ex.targetBodyParts.includes('Upper Back')) category = 'Upper Back';
            else if (ex.targetBodyParts.includes('Lower Back')) {
              category = 'Lower Back';
              console.log('Found Lower Back exercise by targetBodyParts:', ex.name);
            }
            else if (ex.targetBodyParts.includes('Cardio') || ex.targetBodyParts.includes('Cardiovascular')) category = 'Cardio';
            else if (ex.targetBodyParts.includes('Warmup') || ex.targetBodyParts.includes('Warm-up')) category = 'Warmup';
          }
          
          // Last resort: Check body part directly
          if (!category) {
            const bodyPart = ex.bodyPart?.toLowerCase() || '';
            
            if (bodyPart.includes('biceps')) category = 'Biceps';
            else if (bodyPart.includes('triceps')) category = 'Triceps';
            else if (bodyPart.includes('abs')) category = 'Abs';
            else if (bodyPart.includes('obliques')) category = 'Obliques';
            else if (bodyPart.includes('glutes')) category = 'Glutes';
            else if (bodyPart.includes('hamstrings')) category = 'Hamstrings';
            else if (bodyPart.includes('quads')) category = 'Quads';
            else if (bodyPart.includes('calves')) category = 'Calves';
            else if (bodyPart.includes('shoulder')) category = 'Shoulders';
            else if (bodyPart.includes('chest')) category = 'Chest';
            else if (bodyPart.includes('forearm')) category = 'Forearms';
            else if (bodyPart.includes('lats')) category = 'Lats';
            else if (bodyPart.includes('traps')) category = 'Traps';
            else if (bodyPart.includes('upper back')) category = 'Upper Back';
            else if (bodyPart.includes('lower back')) {
              category = 'Lower Back';
              console.log('Found Lower Back exercise by bodyPart:', ex.name);
            }
            else if (bodyPart.includes('cardio') || bodyPart.includes('cardiovascular')) category = 'Cardio';
            else if (bodyPart.includes('warmup') || bodyPart.includes('warm-up') || bodyPart.includes('warm up')) category = 'Warmup';
            // Handle broader body part categories
            else if (bodyPart.includes('upper arms')) {
              // Default to Biceps if we can't determine more specifically
              category = 'Biceps';
            }
            else if (bodyPart.includes('upper legs')) {
              // Default to Quads if we can't determine more specifically
              category = 'Quads';
            }
            else if (bodyPart.includes('lower legs')) {
              category = 'Calves';
            }
            else if (bodyPart.includes('abdomen')) {
              category = 'Abs';
            }
          }
          
          // Special case: Check for cardio by exercise type or name
          if (!category && ex.type?.toLowerCase() === 'cardio') {
            category = 'Cardio';
          }
          
          // Check if the exercise name suggests it's a cardio or warmup exercise
          if (!category && ex.name) {
            const lowerName = ex.name.toLowerCase();
            if (lowerName.includes('run') || lowerName.includes('cardio') || lowerName.includes('jog') || 
                lowerName.includes('sprint') || lowerName.includes('cycling') || lowerName.includes('bike') || 
                lowerName.includes('swimming') || lowerName.includes('jumping jacks') || lowerName.includes('burpee')) {
              category = 'Cardio';
            } else if (lowerName.includes('warmup') || lowerName.includes('warm-up') || lowerName.includes('warm up') || 
                       lowerName.includes('stretch') || lowerName.includes('mobility')) {
              category = 'Warmup';
            }
          }
          
          // If we determined a category, add the exercise
          if (category && Object.values(categoryMap).includes(category)) {
            grouped[category].push(ex);
            // Track counts for debugging
            if (isOriginal) {
              exerciseCountByCategory[category].original++;
            } else {
              exerciseCountByCategory[category].musco++;
            }
          } 
          // Special case for Upper Arms when not already categorized
          else if (category === 'Upper Arms' || ex.bodyPart === 'Upper Arms') {
            // Distribute to both Biceps and Triceps
            grouped['Biceps'].push(ex);
            grouped['Triceps'].push(ex);
            if (isOriginal) {
              exerciseCountByCategory['Biceps'].original++;
              exerciseCountByCategory['Triceps'].original++;
            } else {
              exerciseCountByCategory['Biceps'].musco++;
              exerciseCountByCategory['Triceps'].musco++;
            }
          } 
          // Create "Other" category for anything else
          else {
            if (!grouped['Other']) {
              grouped['Other'] = [];
              exerciseCountByCategory['Other'] = { musco: 0, original: 0 };
            }
            grouped['Other'].push(ex);
            if (isOriginal) {
              exerciseCountByCategory['Other'].original++;
            } else {
              exerciseCountByCategory['Other'].musco++;
            }
          }
        });
        
        // Log category statistics for debugging
        console.log('Exercise counts by category:', 
          Object.entries(exerciseCountByCategory)
            .map(([cat, counts]) => `${cat}: ${counts.musco + counts.original} (${counts.musco} Musco, ${counts.original} Original)`)
            .join(', ')
        );

        // Sort exercises alphabetically within each category
        Object.keys(grouped).forEach((cat) => {
          grouped[cat].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        });

        // Get a sorted list of body parts for consistent display order
        const sortedBodyParts = Object.keys(grouped).sort();
        console.log(`Sorted body parts: ${sortedBodyParts.join(', ')}`);

        setExercisesByBodyPart(grouped);
      } catch (error) {
        console.error('Failed to load exercises', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [showMuscoExercises, locale]);

  // Update equipment data when toggling exercise source
  useEffect(() => {
    // When toggling exercise source, update equipment data
    if (showMuscoExercises) {
      setAllEquipment(muscoEquipmentData.equipment);
      setEquipmentCounts(muscoEquipmentData.counts);
    } else {
      setAllEquipment(originalEquipmentData.equipment);
      setEquipmentCounts(originalEquipmentData.counts);
    }
    // Reset equipment filters when switching
    setSelectedEquipment([]);
    setShowAllEquipment(false);
  }, [showMuscoExercises, muscoEquipmentData, originalEquipmentData]);

  // Toggle expanded state for exercises within a body part
  const handleToggleExercise = useCallback((bodyPart: string, exerciseName: string) => {
    setExpandedExercises((prev) => {
      const prevExpanded = prev[bodyPart] || [];
      if (prevExpanded.includes(exerciseName)) {
        return { ...prev, [bodyPart]: prevExpanded.filter((n) => n !== exerciseName) };
      } else {
        return { ...prev, [bodyPart]: [...prevExpanded, exerciseName] };
      }
    });
  }, []);

  // Toggle category collapse/expand with scroll into view
  const handleToggleCategory = useCallback((bodyPart: string) => {
    setExpandedCategories((prev) => {
      const isExpanding = !prev.includes(bodyPart);
      const newExpanded = isExpanding 
        ? [...prev, bodyPart] 
        : prev.filter((b) => b !== bodyPart);
      
      // If expanding, scroll to the category after state update
      if (isExpanding) {
        setTimeout(() => {
          const element = categoryRefs.current[bodyPart];
          if (element) {
            const yOffset = -20; // Add some space above the element
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100); // Small delay to ensure DOM is updated
      }
      
      return newExpanded;
    });
  }, []);

  // Toggle equipment filter
  const toggleEquipmentFilter = useCallback((equipment: string) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipment)) {
        return prev.filter(eq => eq !== equipment);
      } else {
        return [...prev, equipment];
      }
    });
  }, []);

  // Clear all equipment filters
  const clearEquipmentFilters = useCallback(() => {
    setSelectedEquipment([]);
  }, []);

  // Filter exercises based on search query and equipment filters
  const getFilteredExercises = useCallback(() => {
    if (!searchQuery.trim() && selectedEquipment.length === 0) {
      return exercisesByBodyPart; // Return all if no search and no equipment filter
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    const filtered: BodyPartExercises = {};

    // Filter exercises by name, body part, and equipment
    Object.entries(exercisesByBodyPart).forEach(([bodyPart, exercises]) => {
      // Check if body part matches search
      const bodyPartMatches = bodyPart.toLowerCase().includes(lowerQuery);
      
      // Filter exercises that match the search and equipment filters
      const matchingExercises = exercises.filter(ex => {
        // Check search criteria
        const matchesSearch = !searchQuery || 
          ex.name?.toLowerCase().includes(lowerQuery) || 
          bodyPartMatches || 
          ex.targetBodyParts?.some(bp => bp.toLowerCase().includes(lowerQuery)) || 
          ex.muscles?.some(m => m.toLowerCase().includes(lowerQuery));
        
        // Check equipment criteria
        const matchesEquipment = selectedEquipment.length === 0 || 
          (ex.equipment && Array.isArray(ex.equipment) && 
           selectedEquipment.some(eq => ex.equipment?.includes(eq)));
        
        return matchesSearch && matchesEquipment;
      });

      if (matchingExercises.length > 0) {
        filtered[bodyPart] = matchingExercises;
      }
    });

    return filtered;
  }, [exercisesByBodyPart, searchQuery, selectedEquipment]);

  // Get all the filtered results
  const displayExercises = getFilteredExercises();
  
  // Fix auto-expand useEffect to avoid infinite loop
  useEffect(() => {
    if (searchQuery.trim()) {
      // Expand all categories with matching exercises
      setExpandedCategories(Object.keys(displayExercises));
    } else if (expandedCategories.length === Object.keys(exercisesByBodyPart).length) {
      // Collapse all categories when clearing search if all were previously expanded
      setExpandedCategories([]);
    }
  }, [searchQuery]); // Only dependency on searchQuery - we don't want to react to displayExercises changes

  // Handle video click
  const handleVideoClick = async (exercise: Exercise) => {
    const exerciseIdentifier = exercise.name || exercise.id;
    if (loadingVideoExercise === exerciseIdentifier) return;
    
    // Check for preloaded URL first
    if (preloadedVideoUrls[exercise.name]) {
      console.log(`Using preloaded URL for ${exercise.name}`);
      setVideoUrl(preloadedVideoUrls[exercise.name]);
      return;
    }

    // Helper function to search YouTube and update video URL
    const searchYouTubeAndUpdateUrl = async () => {
      setLoadingVideoExercise(exerciseIdentifier);
      try {
        const searchQuery = `${exercise.name} proper form`;
        const youtubeUrl = await searchYouTubeVideo(searchQuery);
        if (youtubeUrl) {
          exercise.videoUrl = youtubeUrl;
          setVideoUrl(getVideoEmbedUrl(youtubeUrl));
        } else {
          console.log('No YouTube video found for:', searchQuery);
          setVideoUrl(null);
        }
      } catch (error) {
        console.error('Error fetching YouTube video:', error);
        setVideoUrl(null);
      } finally {
        setLoadingVideoExercise(null);
      }
    };

    // Main logic for handling video URLs
    if (exercise.videoUrl) {
      if (isFirebaseStorageUrl(exercise.videoUrl)) {
        // Fetch Firebase download URL
        setLoadingVideoExercise(exerciseIdentifier);
        try {
          const storageRef = ref(storage, exercise.videoUrl);
          const downloadUrl = await getDownloadURL(storageRef);
          setVideoUrl(downloadUrl);
        } catch (error) {
          console.error('Error fetching Firebase video URL:', error);
          setVideoUrl(null);
        } finally {
          setLoadingVideoExercise(null);
        }
      } else if (isVimeoUrl(exercise.videoUrl)) {
        await searchYouTubeAndUpdateUrl();
      } else {
        setVideoUrl(getVideoEmbedUrl(exercise.videoUrl));
      }
    } else {
      await searchYouTubeAndUpdateUrl();
    }
  };

  const closeVideo = () => setVideoUrl(null);

  // Hide navigation menu when video is open
  useEffect(() => {
    if (videoUrl) {
      document.body.classList.add('video-modal-open');
      return () => {
        document.body.classList.remove('video-modal-open');
      };
    }
  }, [videoUrl]);

  // Render video modal
  const renderVideoModal = () => {
    if (!videoUrl) return null;

    return (
      <div
        className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[10000] m-0 p-0"
        style={{ margin: 0, padding: 0 }}
        onClick={closeVideo}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closeVideo}
            className="absolute top-16 right-6 bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 z-[10001] shadow-lg"
            aria-label="Close video"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {videoUrl && videoUrl.includes('firebasestorage.googleapis.com') ? (
            <div className="w-full h-full flex items-center justify-center">
              <video
                className="max-h-full max-w-full h-full object-contain"
                src={videoUrl}
                controls
                autoPlay
                playsInline
              ></video>
            </div>
          ) : videoUrl && isYouTubeUrl(videoUrl) ? (
            <div className="w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title="Exercise Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : videoUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <video
                className="max-h-full max-w-full h-full object-contain"
                src={videoUrl}
                controls
                autoPlay
                playsInline
              ></video>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // Toggle between Musco and original exercises
  const toggleExerciseSource = useCallback((showMusco: boolean) => {
    setShowMuscoExercises(showMusco);
    // Equipment filters are reset in the useEffect
  }, []);

  // Get visible equipment items (limited or all)
  const visibleEquipment = useMemo(() => {
    if (showAllEquipment || allEquipment.length <= 10) {
      return allEquipment;
    }
    return allEquipment.slice(0, 10);
  }, [allEquipment, showAllEquipment]);

  return (
    <div className="w-full bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-center text-indigo-200 mb-8">Available Exercises</h1>
        
        {/* Total exercise count */}
        <p className="text-center font-serif italic text-gray-400 mb-6">
          {Object.values(exercisesByBodyPart).reduce((total, exercises) => total + exercises.length, 0)} total exercises
        </p>
        
        {/* Exercise source toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 p-1 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                showMuscoExercises
                  ? 'bg-indigo-600 text-white'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => toggleExerciseSource(true)}
            >
              bodAI Exercises
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                !showMuscoExercises
                  ? 'bg-indigo-600 text-white'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => toggleExerciseSource(false)}
            >
              Other Exercises
            </button>
          </div>
        </div>
        
        {/* Equipment filters */}
        {allEquipment.length > 0 && (
          <div className="mb-6 bg-gray-800/80 p-5 rounded-xl shadow-lg border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Filter by Equipment</h2>
              {selectedEquipment.length > 0 && (
                <button 
                  className="text-xs text-indigo-300 hover:text-indigo-200 underline flex items-center"
                  onClick={clearEquipmentFilters}
                >
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filters
                </button>
              )}
            </div>

            {selectedEquipment.length === 0 && (
              <p className="text-xs text-gray-400 mb-3">
                Select equipment to filter exercises by available gear
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {visibleEquipment.map(equipment => (
                <Chip 
                  key={equipment}
                  variant={selectedEquipment.includes(equipment) ? 'active' : 'default'}
                  size="md"
                  onClick={() => toggleEquipmentFilter(equipment)}
                  className={`${
                    selectedEquipment.includes(equipment) 
                    ? 'bg-indigo-600 text-white font-medium ring-2 ring-indigo-400 shadow-md' 
                    : 'bg-gray-700/60 text-gray-200 hover:bg-gray-700'
                  } transition-all duration-200`}
                >
                  {equipment} ({equipmentCounts[equipment] || 0})
                </Chip>
              ))}
              
              {allEquipment.length > 10 && (
                <button 
                  className="text-sm text-indigo-300 hover:text-indigo-200 ml-2 underline"
                  onClick={() => setShowAllEquipment(!showAllEquipment)}
                >
                  {showAllEquipment ? 'Show less' : `Show ${allEquipment.length - 10} more`}
                </button>
              )}
            </div>
            
            {selectedEquipment.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <p className="text-sm text-indigo-200 flex items-start">
                  <svg className="w-4 h-4 mr-2 mt-0.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Showing exercises with: {selectedEquipment.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Search input */}
        <div className="relative w-full max-w-lg mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-3 pl-10 text-sm text-white border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search exercises by name, body part, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setSearchQuery('')}
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : Object.keys(displayExercises).length === 0 ? (
          <div className="text-center py-16">
            {searchQuery ? (
              <p className="text-white">No exercises found matching &ldquo;{searchQuery}&rdquo;</p>
            ) : (
              <p className="text-white">No exercises available</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sort body parts alphabetically for consistent display */}
            {Object.keys(displayExercises).sort().map((bodyPart) => {
              const exercises = displayExercises[bodyPart];
              const isCategoryExpanded = expandedCategories.includes(bodyPart);
              const exerciseCount = exercises.length;

              return (
                <section 
                  key={bodyPart} 
                  className="space-y-4"
                  ref={(el: HTMLElement | null) => { categoryRefs.current[bodyPart] = el; }}
                >
                  <button
                    className="flex items-center w-full text-left text-white group"
                    onClick={() => handleToggleCategory(bodyPart)}
                  >
                    <svg
                      className={`w-5 h-5 mr-2 text-white transition-transform duration-200 group-hover:text-white ${
                        isCategoryExpanded ? 'rotate-90' : 'rotate-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-white group-hover:text-white">
                      {bodyPart}
                    </h2>
                    <span className="ml-2 text-sm text-gray-400">({exerciseCount})</span>
                  </button>

                  {isCategoryExpanded && (
                    <div className="space-y-6 pl-7">
                      {exercises.length > 0 ? (
                        exercises.map((ex) => (
                          <ExerciseCard
                            key={ex.id || ex.exerciseId || ex.name}
                            exercise={ex}
                            isExpanded={(expandedExercises[bodyPart] || []).includes(ex.name)}
                            onToggle={() => handleToggleExercise(bodyPart, ex.name)}
                            onVideoClick={() => handleVideoClick(ex)}
                            compact={true}
                            loadingVideoExercise={loadingVideoExercise}
                          />
                        ))
                      ) : (
                        <div className="py-4 text-center text-gray-400">
                          <p>No {showMuscoExercises ? 'bodAI' : 'other'} exercises available for {bodyPart}</p>
                          <p className="text-sm mt-1">Try switching the exercise source using the toggle above</p>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
      {/* Render video modal */}
      {renderVideoModal()}
    </div>
  );
} 