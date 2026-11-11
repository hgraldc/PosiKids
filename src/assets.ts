import manifest from "../imm-assets.json";

const aliases: Record<string, string> = {
  logo: "logo-posikids",
  hero: "maskot-zaa-zee-mimi-membawa-paket",
  "home-bg": "latar-kantor-pos",
  "office-bg": "latar-ruangan-kantor",
  "paper-bg": "latar-dialog-krem-dengan-dekor",
  "reading-bg": "latar-dialog-krem-polos",
  "map-bg": "latar-peta-jalan",
  zaa: "maskot-zaa-berdiri-menyapa-01",
  zee: "maskot-zee-berdiri-menyapa",
  "reading-zaa": "maskot-zaa-memegang-surat",
  "reading-zee": "maskot-zee-memegang-surat",
  "zaa-head": "maskot-zaa-kepala",
  "zee-head": "maskot-zee-kepala",
  "select-zaa": "kartu-maskot-zaa",
  "select-zee": "kartu-maskot-zee",
  "mimi-happy": "maskot-mimi-kucing-ceria",
  "mimi-retry": "maskot-mimi-kucing-sedih",
  family: "maskot-zaa-mimi-zee",
  puzzle: "maskot-zaa-zee-bersama-mimi",
  "blue-triangle": "rumah-segitiga-biru",
  "red-triangle": "rumah-segitiga-merah",
  "blue-circle": "rumah-lingkaran-biru",
  "red-circle": "rumah-lingkaran-merah",
  "yellow-star": "rumah-bintang-kuning",
  "purple-star": "rumah-bintang-ungu",
  "yellow-square": "rumah-persegi-kuning",
  "purple-rectangle": "rumah-persegi-ungu",
  "green-rectangle": "rumah-persegi-hijau",
  "orange-pentagon": "rumah-segilima-oranye",
};

export function artwork(name: string) {
  const key =
    aliases[name] ??
    (name.startsWith("number-")
      ? name.replace("number-", "rumah-angka-")
      : [
            "rara",
            "beni",
            "mora",
            "roni",
            "amar",
            "dewi",
            "vena",
            "miya",
          ].includes(name)
        ? `kartu-tokoh-${name}`
        : name);
  const size = (manifest as Record<string, number[]>)[key];
  if (!size) throw new Error(`Aset IMM tidak ditemukan: ${name}`);
  return { src: `/assets/${key}.webp`, width: size[0], height: size[1] };
}

export function stageArtwork(id: number, available: boolean) {
  // The supplied file is named "terkunci", but its artwork shows an open lock.
  if (id === 1) return "kartu-tahap-bentuk-warna-terkunci";
  return `kartu-tahap-${id === 2 ? "angka" : "membaca"}-${available ? "terbuka" : "terkunci"}`;
}
