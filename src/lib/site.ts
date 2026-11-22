export const SITE = {
  url: "https://mrtig.dev",
  contact: {
    name: "Kaushik Narumanchi",
    title: "AI & Backend Engineer",
    email: "kaushiknaru2002@gmail.com",
    linkedin: "https://www.linkedin.com/in/kaushikn2002",
    url: "https://mrtig.dev",
  },
  github: "https://github.com/MrTig-afk",
  medium: "https://medium.com/@kaushiknaru2002",
  web3formsKey: "8b0c55f8-c965-4da2-9be4-5759b65d6a5b", // public client key by design (Web3Forms)
} as const;

// Owed by the owner (PRD section 13): his statement line and the intro video. Placeholders until then.
export const HOME: {
  statement: string;
  statementIsPlaceholder: boolean;
  video: { src: string; poster: string; captions: string } | null;
} = {
  statement: "I automate the boring parts of my own life, then ship them.",
  statementIsPlaceholder: true,
  video: null,
};
