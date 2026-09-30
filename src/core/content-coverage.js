import { activityCatalog } from '../content/activity-catalog.js';
import { getAgeExperienceProfile } from './age-experience-policy.js';

export function getContentCoverageByAge() {
  return Object.fromEntries(Object.entries({
    '6-12m': 0, '12-18m': 0, '18-24m': 0, '2-3y': 0, '3-4y': 0, '4-5y': 0
  }).map(([ageId]) => {
    const activities = activityCatalog.filter((activity) => activity.ages?.includes(ageId));
    const audioPlanned = activities.filter((activity) => activity.audioNeeds?.length).length;
    const worlds = new Set(activities.map((activity) => activity.world).filter(Boolean));
    return [ageId, {
      ageId,
      profile: getAgeExperienceProfile(ageId).label,
      activities: activities.length,
      audioPlanned,
      worlds: worlds.size,
      categories: new Set(activities.map((activity) => activity.category).filter(Boolean)).size
    }];
  }));
}

export function getContentCoverageGaps() {
  return Object.values(getContentCoverageByAge()).filter((item) => item.activities === 0);
}
