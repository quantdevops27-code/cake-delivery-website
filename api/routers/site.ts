import { z } from "zod";
import { adminQuery, createRouter, publicQuery } from "../middleware";
import { demoHeroSlides } from "../demo-data";

const heroSlideInput = z.object({
  id: z.number(),
  title: z.string().min(1),
  highlight: z.string().min(1),
  text: z.string().min(1),
  product: z.string().min(1),
  image: z.string().min(1),
  price: z.string().min(1),
  accent: z.string().min(1),
  mood: z.string().min(1),
  wash: z.string().min(1),
  searchPlaceholder: z.string().min(1),
  badgeOne: z.string().min(1),
  badgeTwo: z.string().min(1),
  badgeThree: z.string().min(1),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

export const siteRouter = createRouter({
  getHeroSlides: publicQuery.query(async () =>
    [...demoHeroSlides]
      .filter((slide) => slide.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  ),

  adminListHeroSlides: adminQuery.query(async () =>
    [...demoHeroSlides].sort((a, b) => a.sortOrder - b.sortOrder)
  ),

  updateHeroSlide: adminQuery.input(heroSlideInput).mutation(async ({ input }) => {
    const index = demoHeroSlides.findIndex((slide) => slide.id === input.id);
    if (index === -1) {
      demoHeroSlides.push(input);
      return input;
    }

    demoHeroSlides[index] = {
      ...demoHeroSlides[index],
      ...input,
    };
    return demoHeroSlides[index];
  }),
});
