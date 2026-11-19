import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const inputPath = resolve(process.cwd(), "guests.example.json");
const outputPath = resolve(process.cwd(), "guest-links.txt");
const baseUrl = (process.env.INVITE_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

/**
 * @typedef {Object} Guest
 * @property {string} name
 * @property {string=} invite
 * @property {"single"|"couple"|"family"} type
 * @property {string=} partner
 * @property {number=} children
 */

/** @type {Guest[]} */
const guests = JSON.parse(readFileSync(inputPath, "utf8"));

const lines = guests.map((guest, index) => {
  const type = ["single", "couple", "family"].includes(guest.type) ? guest.type : "single";
  const params = new URLSearchParams({
    name: guest.name,
    type,
  });

  if (guest.invite) {
    params.set("invite", guest.invite);
  }

  if (type === "couple" && guest.partner) {
    params.set("partner", guest.partner);
  }

  if (type === "family" && Number.isFinite(guest.children)) {
    params.set("children", String(Math.max(0, Number(guest.children))));
  }

  const url = `${baseUrl}/?${params.toString()}`;
  return `${index + 1}. ${guest.name} (${type})\n${url}`;
});

writeFileSync(outputPath, `${lines.join("\n\n")}\n`, "utf8");
console.log(`Generated ${guests.length} links in ${outputPath}`);
