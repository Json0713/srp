import {
  canInteract,
  findNearestInteractableResource,
  tryCollectResource,
  ResourceState
} from './interaction.system';

describe('Interaction System', () => {
  it('should return true when within interaction distance', () => {
    const player = { x: 100, y: 100 };
    const resource = { x: 110, y: 100 };
    expect(canInteract(player, resource, 20)).toBe(true);
  });

  it('should return false when outside interaction distance', () => {
    const player = { x: 100, y: 100 };
    const resource = { x: 130, y: 100 };
    expect(canInteract(player, resource, 20)).toBe(false);
  });

  it('should collect a resource in range and mark it as collected', () => {
    const player = { x: 50, y: 50 };
    const resources: ResourceState[] = [
      { id: '1', position: { x: 55, y: 50 }, collected: false },
      { id: '2', position: { x: 200, y: 200 }, collected: false }
    ];

    const result = tryCollectResource(player, resources, 30);
    expect(result.collectedId).toBe('1');
    expect(result.updatedResources[0].collected).toBe(true);
    expect(result.updatedResources[1].collected).toBe(false);
  });

  it('should not collect an already collected resource', () => {
    const player = { x: 50, y: 50 };
    const resources: ResourceState[] = [{ id: '1', position: { x: 55, y: 50 }, collected: true }];

    const result = tryCollectResource(player, resources, 30);
    expect(result.collectedId).toBeNull();
    expect(result.updatedResources[0].collected).toBe(true);
  });

  it('should only collect one resource at a time if multiple are in range', () => {
    const player = { x: 50, y: 50 };
    const resources: ResourceState[] = [
      { id: '1', position: { x: 55, y: 50 }, collected: false },
      { id: '2', position: { x: 45, y: 50 }, collected: false }
    ];

    const result = tryCollectResource(player, resources, 30);
    expect(result.collectedId).toBe('1');
    expect(result.updatedResources[0].collected).toBe(true);
    expect(result.updatedResources[1].collected).toBe(false);
  });

  it('should find nearest uncollected interactable resource in range', () => {
    const player = { x: 50, y: 50 };
    const resources: ResourceState[] = [
      { id: 'far', position: { x: 70, y: 50 }, collected: false },
      { id: 'near', position: { x: 55, y: 50 }, collected: false }
    ];

    const nearest = findNearestInteractableResource(player, resources, 30);
    expect(nearest?.id).toBe('near');
  });
});
