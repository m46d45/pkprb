import type { HazardId } from "@/lib/types";

/** Significant events 2000–now. Prototype (BNPB / EM-DAT / laporan publik), not full DIBI. */
export type HistEvent = {
  id: string;
  year: number;
  name: string;
  province: string;
  hazards: HazardId[];
  deaths: number;
  source: string;
};

export const events: HistEvent[] = [
  { id: "e1", year: 2000, name: "Gempa Enggano", province: "Bengkulu", hazards: ["gempa"], deaths: 103, source: "USGS / BNPB" },
  { id: "e2", year: 2004, name: "Tsunami Samudra Hindia", province: "Aceh", hazards: ["tsunami", "gempa"], deaths: 167062, source: "BNPB / EM-DAT" },
  { id: "e3", year: 2004, name: "Tsunami Samudra Hindia (Nias)", province: "Sumatera Utara", hazards: ["tsunami", "gempa"], deaths: 130, source: "BNPB" },
  { id: "e4", year: 2005, name: "Gempa Nias–Simeulue", province: "Sumatera Utara", hazards: ["gempa", "tsunami"], deaths: 915, source: "BNPB / USGS" },
  { id: "e5", year: 2006, name: "Gempa Yogyakarta", province: "Daerah Istimewa Yogyakarta", hazards: ["gempa"], deaths: 4748, source: "BNPB" },
  { id: "e6", year: 2006, name: "Gempa Yogyakarta (Klaten)", province: "Jawa Tengah", hazards: ["gempa"], deaths: 1041, source: "BNPB" },
  { id: "e7", year: 2006, name: "Tsunami Pangandaran", province: "Jawa Barat", hazards: ["tsunami", "gempa"], deaths: 668, source: "BNPB" },
  { id: "e8", year: 2006, name: "Erupsi Merapi", province: "Daerah Istimewa Yogyakarta", hazards: ["gunungapi"], deaths: 224, source: "BNPB" },
  { id: "e9", year: 2006, name: "Erupsi Merapi (Magelang/Boyolali)", province: "Jawa Tengah", hazards: ["gunungapi"], deaths: 53, source: "BNPB" },
  { id: "e10", year: 2007, name: "Banjir Jakarta", province: "DKI Jakarta", hazards: ["banjir"], deaths: 80, source: "BNPB" },
  { id: "e11", year: 2007, name: "Gempa Bengkulu", province: "Bengkulu", hazards: ["gempa", "tsunami"], deaths: 25, source: "USGS / BNPB" },
  { id: "e12", year: 2009, name: "Gempa Padang", province: "Sumatera Barat", hazards: ["gempa"], deaths: 1117, source: "BNPB" },
  { id: "e13", year: 2009, name: "Gempa Tasikmalaya", province: "Jawa Barat", hazards: ["gempa"], deaths: 81, source: "BNPB" },
  { id: "e14", year: 2010, name: "Tsunami Mentawai", province: "Sumatera Barat", hazards: ["tsunami", "gempa"], deaths: 408, source: "BNPB" },
  { id: "e15", year: 2010, name: "Banjir bandang Wasior", province: "Papua Barat", hazards: ["banjir", "longsor"], deaths: 145, source: "BNPB" },
  { id: "e16", year: 2010, name: "Erupsi Merapi", province: "Daerah Istimewa Yogyakarta", hazards: ["gunungapi"], deaths: 277, source: "BNPB" },
  { id: "e17", year: 2010, name: "Erupsi Merapi", province: "Jawa Tengah", hazards: ["gunungapi"], deaths: 76, source: "BNPB" },
  { id: "e18", year: 2013, name: "Banjir Jakarta", province: "DKI Jakarta", hazards: ["banjir"], deaths: 40, source: "BNPB" },
  { id: "e19", year: 2014, name: "Longsor Banjarnegara", province: "Jawa Tengah", hazards: ["longsor"], deaths: 95, source: "BNPB" },
  { id: "e20", year: 2014, name: "Erupsi Kelud", province: "Jawa Timur", hazards: ["gunungapi"], deaths: 7, source: "BNPB" },
  { id: "e21", year: 2014, name: "Erupsi Sinabung", province: "Sumatera Utara", hazards: ["gunungapi"], deaths: 16, source: "BNPB" },
  { id: "e22", year: 2014, name: "Banjir Manado", province: "Sulawesi Utara", hazards: ["banjir"], deaths: 19, source: "BNPB" },
  { id: "e23", year: 2015, name: "Karhutla", province: "Riau", hazards: ["karhutla"], deaths: 8, source: "BNPB (korban langsung; understated)" },
  { id: "e24", year: 2015, name: "Karhutla", province: "Jambi", hazards: ["karhutla"], deaths: 4, source: "BNPB (korban langsung; understated)" },
  { id: "e25", year: 2015, name: "Karhutla", province: "Sumatera Selatan", hazards: ["karhutla"], deaths: 5, source: "BNPB (korban langsung; understated)" },
  { id: "e26", year: 2015, name: "Karhutla", province: "Kalimantan Tengah", hazards: ["karhutla"], deaths: 6, source: "BNPB (korban langsung; understated)" },
  { id: "e27", year: 2015, name: "Karhutla", province: "Kalimantan Barat", hazards: ["karhutla"], deaths: 4, source: "BNPB (korban langsung; understated)" },
  { id: "e28", year: 2016, name: "Gempa Pidie Jaya", province: "Aceh", hazards: ["gempa"], deaths: 104, source: "BNPB" },
  { id: "e29", year: 2016, name: "Banjir–longsor Garut", province: "Jawa Barat", hazards: ["banjir", "longsor"], deaths: 34, source: "BNPB" },
  { id: "e30", year: 2018, name: "Rangkaian gempa Lombok", province: "Nusa Tenggara Barat", hazards: ["gempa"], deaths: 564, source: "BNPB" },
  { id: "e31", year: 2018, name: "Gempa–tsunami–likuefaksi Palu", province: "Sulawesi Tengah", hazards: ["gempa", "tsunami", "likuefaksi"], deaths: 4340, source: "BNPB" },
  { id: "e32", year: 2018, name: "Tsunami Anak Krakatau", province: "Banten", hazards: ["tsunami", "gunungapi"], deaths: 390, source: "BNPB" },
  { id: "e33", year: 2018, name: "Tsunami Anak Krakatau", province: "Lampung", hazards: ["tsunami", "gunungapi"], deaths: 47, source: "BNPB" },
  { id: "e34", year: 2019, name: "Banjir Sentani", province: "Papua", hazards: ["banjir", "longsor"], deaths: 112, source: "BNPB" },
  { id: "e35", year: 2019, name: "Gempa Ambon", province: "Maluku", hazards: ["gempa"], deaths: 31, source: "BNPB" },
  { id: "e36", year: 2020, name: "Banjir Jakarta", province: "DKI Jakarta", hazards: ["banjir"], deaths: 66, source: "BNPB" },
  { id: "e37", year: 2021, name: "Gempa Mamuju–Majene", province: "Sulawesi Barat", hazards: ["gempa"], deaths: 107, source: "BNPB" },
  { id: "e38", year: 2021, name: "Siklon Seroja", province: "Nusa Tenggara Timur", hazards: ["banjir", "longsor"], deaths: 183, source: "BNPB" },
  { id: "e39", year: 2021, name: "Banjir Kalimantan Selatan", province: "Kalimantan Selatan", hazards: ["banjir"], deaths: 24, source: "BNPB" },
  { id: "e40", year: 2021, name: "Erupsi Semeru", province: "Jawa Timur", hazards: ["gunungapi"], deaths: 51, source: "BNPB" },
  { id: "e41", year: 2022, name: "Gempa Cianjur", province: "Jawa Barat", hazards: ["gempa"], deaths: 334, source: "BNPB" },
  { id: "e42", year: 2024, name: "Banjir–longsor Sumatera Barat", province: "Sumatera Barat", hazards: ["banjir", "longsor"], deaths: 67, source: "BNPB" },
  { id: "e43", year: 2003, name: "Gempa Alor", province: "Nusa Tenggara Timur", hazards: ["gempa"], deaths: 51, source: "USGS / BNPB" },
  { id: "e44", year: 2018, name: "Banjir–longsor NTT", province: "Nusa Tenggara Timur", hazards: ["banjir", "longsor"], deaths: 64, source: "BNPB" },
  { id: "e45", year: 2023, name: "Banjir bandang Luwu", province: "Sulawesi Selatan", hazards: ["banjir", "longsor"], deaths: 15, source: "BNPB" },
];
