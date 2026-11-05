/** Opaque reference to a body owned by the physics engine. */
export type BodyHandle = number & { readonly __brand: 'BodyHandle' };
