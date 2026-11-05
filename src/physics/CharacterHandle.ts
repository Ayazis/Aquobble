/** Opaque reference to a character controller owned by the physics engine. */
export type CharacterHandle = number & { readonly __brand: 'CharacterHandle' };
