/* ================= DATOS ================= */
const productosData = [
    // CRISTAL
    { categoria: "cristal", titulo: "Cubo cristal 3D", precio: 400, img: "C1img1.jpeg" },
    { categoria: "cristal", titulo: "Cilindro de cristal 3D", precio: 1200, img: "C1img2.jpeg" },
    { categoria: "cristal", titulo: "Cilindro de cristal 3D", precio: 300, img: "C1img3.jpeg" },
    { categoria: "cristal", titulo: "Cubo de cristal púrpura 3D", precio: 400, img: "C1img4.jpeg" },
    { categoria: "cristal", titulo: "Prisma rectangular de cristal 3D", precio: 500, img: "C1img5.jpeg" },
    { categoria: "cristal", titulo: "Cubo de cristal 3D", precio: 600, img: "C1img6.jpeg" },
    { categoria: "cristal", titulo: "Prisma de cristal con base de metal", precio: 700, img: "C1img7.jpeg" },

    // MADERA
    { categoria: "madera", titulo: "Cuadro de madera", precio: 250, img: "C2img1.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con vidrio", precio: 250, img: "C2img2.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con reloj", precio: 450, img: "C2img3.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con fotografía", precio: 350, img: "C2img4.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con lámina de vidrio", precio: 750, img: "C2img5.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con lámina dorada", precio: 800, img: "C2img6.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con lámina cubierta de vidrio", precio: 950, img: "C2img7.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con lámina dorada y reloj", precio: 1000, img: "C2img8.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con lámina de metal plateada", precio: 750, img: "C2img9.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con lámina color dorado y figura", precio: 650, img: "C2img10.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera color negro con lamina dorada", precio: 750, img: "C2img11.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con cubierta de vidrio ", precio: 750, img: "C2img12.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera color negro con lamina plateada", precio: 950, img: "C2img13.jpeg" },
    { categoria: "madera", titulo: "Cuadro de madera con vidrio", precio: 750, img: "C2img14.jpeg" },

    // VIDRIO
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de metal", precio: 1200, img: "C3img1.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de madera", precio: 1500, img: "C3img2.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de cristal", precio: 1800, img: "C3img3.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de piedra", precio: 2000, img: "C3img4.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de madera y cristal", precio: 2500, img: "C3img5.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de madera y cristal", precio: 2500, img: "C3img6.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de madera y cristal", precio: 2500, img: "C3img7.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de madera y cristal", precio: 2500, img: "C3img8.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de madera y cristal", precio: 2500, img: "C3img9.jpeg" },
    { categoria: "vidrio", titulo: "Cuadro de vidrio con base de madera y cristal", precio: 2500, img: "C3img10.jpeg" },

    // ACRILICO
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de metal", precio: 1200, img: "C4img1.jpeg" },
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de madera", precio: 1500, img: "C4img2.jpeg" },
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de cristal", precio: 1800, img: "C4img3.jpeg" },
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de piedra", precio: 2000, img: "C4img4.jpeg" },
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de madera y cristal", precio: 2500, img: "C4img5.jpeg" },
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de madera y cristal", precio: 2500, img: "C4img6.jpeg" },
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de madera y cristal", precio: 2500, img: "C4img7.jpeg" },
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de madera y cristal", precio: 2500, img: "C4img8.jpeg" },
    { categoria: "acrilico", titulo: "Cuadro de acrílico con base de madera y cristal", precio: 2500, img: "C4img9.jpeg" },

    // CRISTAL OPTICO
    { categoria: "cristal optico", titulo: "Cubo de cristal óptico 3D", precio: 800, img: "C5img1.jpeg" },
    { categoria: "cristal optico", titulo: "Cilindro de cristal óptico 3D", precio: 1500, img: "C5img2.jpeg" },
    { categoria: "cristal optico", titulo: "Esfera de cristal óptico 3D", precio: 2000, img: "C5img3.jpeg" },
    { categoria: "cristal optico", titulo: "Prisma triangular de cristal óptico 3D", precio: 1800, img: "C5img4.jpeg" },
    { categoria: "cristal optico", titulo: "Prisma rectangular de cristal óptico 3D", precio: 2200, img: "C5img5.jpeg" },
    { categoria: "cristal optico", titulo: "Cubo de cristal óptico con base de madera", precio: 2500, img: "C5img6.jpeg" },
    { categoria: "cristal optico", titulo: "Cilindro de cristal óptico con base de metal", precio: 3000, img: "C5img7.jpeg" },
    { categoria: "cristal optico", titulo: "Esfera de cristal óptico con base de piedra", precio: 3500, img: "C5img8.jpeg" },
    { categoria: "cristal optico", titulo: "Prisma triangular de cristal óptico con base de madera", precio: 4000, img: "C5img9.jpeg" },
    { categoria: "cristal optico", titulo: "Prisma rectangular de cristal óptico con base de metal", precio: 4500, img: "C5img10.jpeg" },

    // PINES
    { categoria: "pines", titulo: "Pin metálico dorado", precio: 150, img: "C6img1.jpeg" },
    { categoria: "pines", titulo: "Pin metálico plateado", precio: 150, img: "C6img2.jpeg" },
    { categoria: "pines", titulo: "Pin esmaltado colorido", precio: 200, img: "C6img3.jpeg" },
    { categoria: "pines", titulo: "Pin con diseño personalizado", precio: 250, img: "C6img4.jpeg" },
    { categoria: "pines", titulo: "Pin con forma de estrella", precio: 180, img: "C6img5.jpeg" },
    { categoria: "pines", titulo: "Pin con forma de corazón", precio: 180, img: "C6img6.jpeg" },
    { categoria: "pines", titulo: "Pin con forma de animal", precio: 220, img: "C6img7.jpeg" },
    { categoria: "pines", titulo: "Pin con forma de logotipo", precio: 300, img: "C6img8.jpeg" },
    { categoria: "pines", titulo: "Pin con forma de bandera", precio: 200, img: "C6img9.jpeg" },

    // TROFEOS
    { categoria: "trofeos", titulo: "Trofeo metálico dorado", precio: 800, img: "C7img1.jpeg" },
    { categoria: "trofeos", titulo: "Trofeo metálico plateado", precio: 800, img: "C7img2.jpeg" },
    { categoria: "trofeos", titulo: "Trofeo con base de madera", precio: 1000, img: "C7img3.jpeg" },
    { categoria: "trofeos", titulo: "Trofeo con base de cristal", precio: 1200, img: "C7img4.jpeg" },
    { categoria: "trofeos", titulo: "Trofeo con diseño personalizado", precio: 1500, img: "C7img5.jpeg" },
    { categoria: "trofeos", titulo: "Trofeo con figura deportiva", precio: 1300, img: "C7img6.jpeg" },
    { categoria: "trofeos", titulo: "Trofeo con figura académica", precio: 1400, img: "C7img7.jpeg" },
    { categoria: "trofeos", titulo: "Trofeo con figura artística", precio: 1600, img: "C7img8.jpeg" },
    { categoria: "trofeos", titulo: "Trofeo con figura musical", precio: 1700, img: "C7img9.jpeg" }
];

/* ================= ELEMENTOS DOM ================= */
const contenedor = document.getElementById("productos");
const buscador = document.getElementById("buscador");

/* ================= FUNCIONES ================= */

// Render dinámico con CARD UIverse
function renderProductos() {
    contenedor.innerHTML = "";

    productosData.forEach(p => {
        contenedor.innerHTML += `
      <div class="col-md-4 d-flex justify-content-center" data-categoria="${p.categoria}">
        <div class="card" style="width: 18rem;">
          <img src="imagenes-productos/${p.img}" class="card-img-top" alt="${p.titulo}">
          <div class="card-body text-center">
            <h5 class="card-title">${p.titulo}</h5>
            <p class="card-text">$ ${p.precio} MXN</p>
            <a href="#" class="btn btn-primary">Comprar</a>
          </div>
        </div>
      </div>
    `;
    });
}

// Filtro
function filtrarProductos() {
    const texto = buscador.value.toLowerCase().trim();
    const cards = document.querySelectorAll("[data-categoria]");

    cards.forEach(card => {
        const categoria = card.dataset.categoria.toLowerCase();
        const contenido = card.innerText.toLowerCase();

        const mostrar = texto === ""
            ? categoria === "cristal"
            : categoria.includes(texto) || contenido.includes(texto);

        card.classList.toggle("oculto", !mostrar);
    });
}

/* ================= EVENTOS ================= */
buscador.addEventListener("input", filtrarProductos);

buscador.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        filtrarProductos();
    }
});

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", () => {
    renderProductos();
    filtrarProductos();
});