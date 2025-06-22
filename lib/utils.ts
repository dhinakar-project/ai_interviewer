



import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

//
// export const interviewCovers = [
//     "/covers/Google.png","/covers/facebook.png","/covers/adobe.png", "/covers/amazon.png", "/covers/hostinger.png",
//     "/covers/pinterest.png", "/covers/quora.png", "/covers/reddit.png", "/covers/skype.png",
//     "/covers/spot4ify.png", "/covers/telegram.png", "/covers/tiktok.png", "/covers/yahoo.png",
// ];
//
//
// export function getStaticCover(id: string): string {
//     const index = parseInt(id, 10) % interviewCovers.length;
//     return interviewCovers[index];
// }
