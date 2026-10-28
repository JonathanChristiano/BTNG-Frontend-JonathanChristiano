// --- CONFIG & GLOBAL VARIABLES ---
const API_URL = "https://api-web.dnccudinus.org/api/mobil";
let carsData = [];
let cartCount = 0;

// Fallback Mock Data jika API server sedang offline/CORS issue
const fallbackCars = [
  {
    id: 1,
    nama: "Porsche 911 GT3 RS",
    kategori: "sport",
    harga: "Rp 5.800.000.000",
    gambar:
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80",
    deskripsi:
      "Supercar bertenaga 525 HP dengan aerodinamika balap profesional.",
  },
  {
    id: 2,
    nama: "BMW M4 Competition",
    kategori: "sport",
    harga: "Rp 2.450.000.000",
    gambar:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
    deskripsi:
      "Coupe sporty premium dengan sistem penggerak roda belakang yang presisi.",
  },
  {
    id: 3,
    nama: "Mercedes-Benz G 63 AMG",
    kategori: "suv",
    harga: "Rp 6.500.000.000",
    gambar:
      "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=600&q=80",
    deskripsi: "SUV tangguh nan mewah dengan mesin V8 Biturbo.",
  },
  {
    id: 4,
    nama: "Audi RS7 Sportback",
    kategori: "sedan",
    harga: "Rp 3.200.000.000",
    gambar:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80",
    deskripsi:
      "Sedan performer berperawakan futuristik dengan interior ultra-modern.",
  },
];

// --- DOM ELEMENTS ---
const carGrid = document.getElementById("carGrid");
const searchInput = document.getElementById("searchInput");
const filterBtns = document.querySelectorAll(".filter-btn");
const cartCountEl = document.getElementById("cartCount");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const carModal = document.getElementById("carModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");

// --- INIT APP ---
document.addEventListener("DOMContentLoaded", () => {
  fetchCars();
  setupEventListeners();
});

// --- INTEGRASI API (FETCH DATA & DOM MANIPULATION) ---
async function fetchCars() {
  // Tampilkan Loading State
  carGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--primary);"></i>
            <p style="margin-top: 15px; color: var(--text-muted);">Mengambil data mobil dari server...</p>
        </div>
    `;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Gagal mengambil data dari API");

    const result = await response.json();
    // Cek struktur respons API (array langsung atau di dalam data)
    carsData = Array.isArray(result) ? result : result.data || fallbackCars;

    // Jika data dari API kosong, pakai fallback
    if (carsData.length === 0) carsData = fallbackCars;

    renderCars(carsData);
  } catch (error) {
    console.warn("API Error/Offline. Menggunakan Mock Data Fallback:", error);
    carsData = fallbackCars;
    renderCars(carsData);
  }
}

// --- RENDER CAR CARDS (DOM MANIPULATION VIA innerHTML) ---
function renderCars(data) {
  carGrid.innerHTML = "";

  if (data.length === 0) {
    carGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p style="color: var(--text-muted);">Mobil tidak ditemukan.</p>
            </div>
        `;
    return;
  }

  data.forEach((car) => {
    const card = document.createElement("div");
    card.className = "car-card";

    // Nilai bawaan jika field API memiliki struktur yang sedikit berbeda
    const namaMobil = car.nama || car.nama_mobil || "Mobil Premium";
    const hargaMobil = car.harga || "Hubungi Dealer";
    const gambarMobil =
      car.gambar ||
      car.foto ||
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80";
    const kategoriMobil = car.kategori || "Sport";
    const deskripsiMobil =
      car.deskripsi ||
      "Nikmati sensasi berkendara luar biasa dengan unit pilihan ini.";

    card.innerHTML = `
            <img src="${gambarMobil}" alt="${namaMobil}" loading="lazy">
            <div class="car-content">
                <span class="car-tag">${kategoriMobil}</span>
                <h3 class="car-title">${namaMobil}</h3>
                <p class="car-price">${hargaMobil}</p>
                <p class="car-desc">${deskripsiMobil.substring(0, 80)}...</p>
                <div class="car-actions">
                    <button class="btn btn-secondary btn-detail" onclick="openDetailModal(${car.id})">Detail</button>
                    <button class="btn btn-primary" onclick="addToCart('${namaMobil}')"><i class="fa-solid fa-cart-plus"></i> Beli</button>
                </div>
            </div>
        `;
    carGrid.appendChild(card);
  });
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Mobile Hamburger Menu
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Close mobile nav when link is clicked
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("active"));
  });

  // Live Search Filter
  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = carsData.filter((car) => {
      const nama = (car.nama || car.nama_mobil || "").toLowerCase();
      return nama.includes(keyword);
    });
    renderCars(filtered);
  });

  // Category Filter Buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");
      if (filterValue === "all") {
        renderCars(carsData);
      } else {
        const filtered = carsData.filter((car) => {
          const cat = (car.kategori || "").toLowerCase();
          return cat.includes(filterValue);
        });
        renderCars(filtered);
      }
    });
  });

  // Close Modal Event
  closeModal.addEventListener("click", () => {
    carModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === carModal) carModal.style.display = "none";
  });
}

// --- OPEN MODAL DETAIL ---
function openDetailModal(id) {
  const car = carsData.find((c) => c.id === id) || fallbackCars[0];
  const namaMobil = car.nama || car.nama_mobil || "Mobil Premium";
  const hargaMobil = car.harga || "Hubungi Dealer";
  const gambarMobil =
    car.gambar ||
    car.foto ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80";
  const deskripsiMobil =
    car.deskripsi ||
    "Pengalaman berkendara mewah dengan performa tak tertandingi.";

  modalBody.innerHTML = `
        <div class="modal-body-content">
            <img src="${gambarMobil}" alt="${namaMobil}">
            <span class="car-tag">${car.kategori || "Sport"}</span>
            <h2 style="margin: 10px 0;">${namaMobil}</h2>
            <h3 style="color: var(--primary); margin-bottom: 15px;">${hargaMobil}</h3>
            <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">${deskripsiMobil}</p>
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="addToCart('${namaMobil}'); carModal.style.display='none';">
                <i class="fa-solid fa-cart-plus"></i> Tambah ke Keranjang
            </button>
        </div>
    `;
  carModal.style.display = "flex";
}

// --- ADD TO CART & TOAST ---
function addToCart(carName) {
  cartCount++;
  cartCountEl.textContent = cartCount;
  showToast(`"<b>${carName}</b>" berhasil ditambahkan!`);
}

function showToast(message) {
  toastMsg.innerHTML = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
