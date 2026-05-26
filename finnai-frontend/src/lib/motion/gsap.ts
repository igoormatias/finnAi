export async function getGsap() {
  const gsap = (await import("gsap")).default;
  return gsap;
}

