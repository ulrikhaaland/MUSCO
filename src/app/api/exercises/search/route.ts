import { NextRequest, NextResponse } from 'next/server';
import { Exercise } from '@/app/types/program';

interface SearchParams {
  bodyParts?: string[];
  query?: string;
  limit?: number;
  locale?: string;
}

// Helper to fetch and parse exercise JSON
async function fetchExercises(path: string): Promise<Exercise[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, { cache: 'force-cache' });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.exercises || [];
  } catch {
    return [];
  }
}

// Map body part names to file paths
function getExerciseFiles(bodyPart: string, useNorwegian: boolean = false): string[] {
  const base = useNorwegian ? '/data/exercises/musco/json2_no/' : '/data/exercises/musco/json2/';
  
  const mapping: Record<string, string[]> = {
    shoulders: [`${base}m_shoulders.json`],
    'upper arms': [`${base}m_biceps.json`, `${base}m_triceps.json`],
    forearms: [`${base}m_forearms.json`],
    chest: [`${base}m_chest.json`],
    abdomen: [`${base}m_abs.json`, `${base}m_obliques.json`],
    'upper back': [`${base}m_upper-back.json`, `${base}m_lats.json`],
    'lower back': [`${base}m_lower-back.json`],
    glutes: [`${base}m_glutes.json`],
    'upper legs': [`${base}m_quads.json`, `${base}m_hamstrings.json`],
    'lower legs': [`${base}m_calves.json`],
    warmup: [`${base}warmups.json`],
    cardio: [`${base}cardio.json`],
  };
  
  const key = bodyPart.toLowerCase();
  return mapping[key] || [];
}

// Fuzzy search exercises by name/description
function searchExercises(exercises: Exercise[], query: string): Exercise[] {
  if (!query) return exercises;
  
  const q = query.toLowerCase();
  return exercises.filter(ex => 
    ex.name?.toLowerCase().includes(q) ||
    ex.description?.toLowerCase().includes(q) ||
    ex.muscles?.some(m => m.toLowerCase().includes(q))
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json();
    const { bodyParts = [], query = '', limit = 6, locale = 'en' } = body;
    
    const useNorwegian = locale.startsWith('no') || locale.startsWith('nb');
    
    let allExercises: Exercise[] = [];
    
    // If specific body parts requested, load those
    if (bodyParts.length > 0) {
      const files = bodyParts.flatMap(bp => getExerciseFiles(bp, useNorwegian));
      const results = await Promise.all(files.map(fetchExercises));
      allExercises = results.flat();
    } else {
      // Load all body parts
      const allBodyParts = ['shoulders', 'upper arms', 'forearms', 'chest', 'abdomen', 
                           'upper back', 'lower back', 'glutes', 'upper legs', 'lower legs'];
      const files = allBodyParts.flatMap(bp => getExerciseFiles(bp, useNorwegian));
      const results = await Promise.all(files.map(fetchExercises));
      allExercises = results.flat();
    }
    
    // Apply search query if provided
    let filtered = query ? searchExercises(allExercises, query) : allExercises;
    
    // Deduplicate by ID
    const seen = new Set<string>();
    filtered = filtered.filter(ex => {
      if (!ex.id || seen.has(ex.id)) return false;
      seen.add(ex.id);
      return true;
    });
    
    // Limit results
    const limited = filtered.slice(0, limit);
    
    return NextResponse.json({ 
      exercises: limited,
      total: filtered.length,
      showing: limited.length
    });
    
  } catch (error) {
    console.error('Exercise search error:', error);
    return NextResponse.json(
      { error: 'Failed to search exercises', exercises: [], total: 0, showing: 0 },
      { status: 500 }
    );
  }
}





