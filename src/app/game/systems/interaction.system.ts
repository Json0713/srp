export interface Position {
  x: number;
  y: number;
}

export interface ResourceState {
  id: string;
  position: Position;
  collected: boolean;
}

export function canInteract(
  playerPosition: Position,
  resourcePosition: Position,
  maxDistance: number
): boolean {
  const dx = playerPosition.x - resourcePosition.x;
  const dy = playerPosition.y - resourcePosition.y;
  return Math.sqrt(dx * dx + dy * dy) <= maxDistance;
}

export function findNearestInteractableResource(
  playerPosition: Position,
  resources: ResourceState[],
  maxDistance: number
): ResourceState | null {
  let nearest: ResourceState | null = null;
  let minDistance = maxDistance;

  for (const resource of resources) {
    if (resource.collected) continue;
    const dx = playerPosition.x - resource.position.x;
    const dy = playerPosition.y - resource.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= minDistance) {
      minDistance = dist;
      nearest = resource;
    }
  }

  return nearest;
}

export function tryCollectResource(
  playerPosition: Position,
  resources: ResourceState[],
  maxDistance: number
): { collectedId: string | null; updatedResources: ResourceState[] } {
  let collectedId: string | null = null;
  const updatedResources = resources.map((resource) => {
    if (
      !resource.collected &&
      !collectedId &&
      canInteract(playerPosition, resource.position, maxDistance)
    ) {
      collectedId = resource.id;
      return { ...resource, collected: true };
    }
    return resource;
  });

  return { collectedId, updatedResources };
}
