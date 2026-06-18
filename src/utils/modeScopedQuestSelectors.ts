import type { AppMode, Quest } from "../types";

export function getQuestAppMode(quest: Quest): AppMode {
  if (quest.appMode === "brainworkout" || quest.appMode === "abi") {
    return quest.appMode;
  }

  return quest.type === "housework" || Boolean(quest.area || quest.brainworkoutQuestType) ? "brainworkout" : "abi";
}

export function withQuestAppMode(quest: Quest): Quest {
  return {
    ...quest,
    appMode: getQuestAppMode(quest),
  };
}

export function getModeScopedQuests(quests: Quest[], activeMode: AppMode): Quest[] {
  return quests.filter((quest) => getQuestAppMode(quest) === activeMode);
}
