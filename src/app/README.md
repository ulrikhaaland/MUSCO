# MUSCO Application

## Program Routes

The program section of the application uses the following route structure:

- `/program` - Main program view showing the weekly overview and exercise details
- `/program/calendar` - Calendar view for selecting program days by date
- `/program/day/[day]` - Detailed view of a specific program day, where `[day]` is the day number (1-7)

## Navigation Flow

Users can navigate between these routes using:

1. The hamburger menu in the top-right corner
2. The calendar button in the header of the program page
3. By clicking on individual days in either the program view or calendar view

## Component Structure

- `ExerciseProgramPage.tsx` - Renders the main program page (`/program`)
- `ExerciseProgramCalendar.tsx` - Renders the calendar view (`/program/calendar`)
- `ProgramDayComponent.tsx` - Renders the individual day details (`/program/day/[day]`)

The `ExerciseProgramContainer.tsx` component has been deprecated and now only serves as a compatibility layer for legacy code, redirecting to the appropriate route. 