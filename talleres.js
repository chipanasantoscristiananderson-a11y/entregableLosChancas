/* ===== Instituto Superior Los Chancas · script COMÚN a las 3 páginas: menú, imágenes, volver arriba y formulario ===== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* 0. Cabecera: se oscurece un poco al bajar */
  const cabecera = $("header");
  const alScroll = () => cabecera && cabecera.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", alScroll, { passive: true });
  alScroll();

  /* 1. Marca en el menú la página donde estás */
  const pagina = location.pathname.split("/").pop() || "index.html";
  $$(".navbar .nav-link:not(.dropdown-toggle)").forEach((a) => {
    if (a.getAttribute("href") === pagina) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
  $$(".navbar .dropdown").forEach((li) => {
    const enEstaPagina = $$(".dropdown-item", li).some((a) => a.getAttribute("href").startsWith(pagina));
    if (enEstaPagina) $(".dropdown-toggle", li).classList.add("active");
  });

  /* 2. Imágenes: carga diferida y aviso visual si una foto no existe */
  $$("img").forEach((img) => {
    if (!img.classList.contains("portada")) img.loading = "lazy";
    const marcar = () => img.classList.add("sin-imagen");
    if (img.complete && img.naturalWidth === 0) marcar();
    else img.addEventListener("error", marcar, { once: true });
  });

  /* 3. Botón para volver arriba */
  const subir = document.createElement("button");
  subir.type = "button";
  subir.className = "subir";
  subir.setAttribute("aria-label", "Volver arriba");
  subir.innerHTML = "&uarr;";
  subir.addEventListener("click", () => window.scrollTo({ top: 0 }));
  document.body.appendChild(subir);
  window.addEventListener("scroll", () => subir.classList.toggle("visible", window.scrollY > 500), { passive: true });

  /* 4. Tema claro / oscuro (se recuerda entre páginas) */
  const raiz = document.documentElement;
  const botonTema = $("#btnTema");
  function aplicarTema(tema, guardar) {
    raiz.setAttribute("data-theme", tema);
    raiz.setAttribute("data-bs-theme", tema);
    if (botonTema) {
      botonTema.textContent = tema === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
      botonTema.setAttribute("aria-label", tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    }
    if (guardar) try { localStorage.setItem("tema", tema); } catch (e) {}
  }
  aplicarTema(raiz.getAttribute("data-theme") || "light", false);
  if (botonTema) {
    botonTema.addEventListener("click", () => {
      aplicarTema(raiz.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
      botonTema.classList.remove("girar");
      void botonTema.offsetWidth;
      botonTema.classList.add("girar");
    });
  }

  /* 5. Animación de entrada al hacer scroll */
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !quieto) {
    raiz.classList.add("js-reveal");
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("visible");
        observador.unobserve(en.target);
        // al terminar, se quita la clase para que el hover vuelva a ser rápido
        setTimeout(() => en.target.classList.remove("reveal", "visible"), 1400);
      });
    }, { threshold: 0.12 });
    $$(".resumen, .beneficio, .paso, .sede, .taller, #carreras .card, main section:not(#inicio) h2, #registro form").forEach((el) => {
      const hermanos = Array.from(el.parentElement.children).filter((h) => h.className === el.className);
      el.style.setProperty("--d", Math.min(hermanos.indexOf(el), 5) * 0.08 + "s");
      el.classList.add("reveal");
      observador.observe(el);
    });
  }

  /* 6. Registro */
  const form = $("#formRegistro");
  if (!form) return;

  const params = new URLSearchParams(location.search);

  // Desde sedes.html: "Elegir esta sede" llega con ?sede=Ate
  const sedeUrl = params.get("sede");
  if (sedeUrl && $("#sede")) $("#sede").value = sedeUrl;

  const reglas = {
    nombres: (v) => (/^\S+(\s+\S+)+$/.test(v.trim()) && v.trim().length >= 5) || "Escribe tu nombre y apellido.",
    dni: (v) => /^\d{8}$/.test(v) || "El DNI debe tener 8 dígitos.",
    edad: (v) => (v >= 15 && v <= 80) || "Escribe una edad entre 15 y 80 años.",
    correo: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Escribe un correo válido, como nombre@correo.com.",
    telefono: (v) => /^9\d{8}$/.test(v.replace(/\s/g, "")) || "El teléfono debe tener 9 dígitos y empezar con 9.",
    sede: (v) => v !== "" || "Elige una sede.",
    carrera: (v) => v !== "" || "Elige una carrera.",
    taller: (v) => v !== "" || "Elige un taller.",
  };

  const campos = Object.keys(reglas).filter((n) => form.elements[n]);

  function mostrarError(campo, mensaje) {
    let aviso = campo.parentElement.querySelector(".invalid-feedback");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.className = "invalid-feedback";
      campo.after(aviso);
    }
    aviso.textContent = mensaje;
    campo.classList.add("is-invalid");
  }

  function limpiarError(campo) {
    campo.classList.remove("is-invalid");
    const aviso = campo.parentElement.querySelector(".invalid-feedback");
    if (aviso) aviso.remove();
  }

  function validarCampo(nombre) {
    const campo = form.elements[nombre];
    const resultado = reglas[nombre](campo.value);
    if (resultado === true) {
      limpiarError(campo);
      return true;
    }
    mostrarError(campo, resultado);
    return false;
  }

  // Restricciones mientras se escribe
  $("#dni").addEventListener("input", (e) => (e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8)));
  $("#telefono").addEventListener("input", (e) => (e.target.value = e.target.value.replace(/[^\d\s]/g, "").slice(0, 11)));

  campos.forEach((nombre) => {
    const campo = form.elements[nombre];
    campo.addEventListener("blur", () => validarCampo(nombre));
    campo.addEventListener("input", () => campo.classList.contains("is-invalid") && validarCampo(nombre));
  });

  /* ---- Simulación del procesamiento del formulario (GET / POST) ----
     No hay servidor, así que se arma lo que viajaría por la red:
     POST -> los datos van en el CUERPO de la petición (no se ven en la URL). Es el método de este formulario.
     GET  -> los datos irían en la URL (?campo=valor), como ya pasa con ?sede=Ate o ?taller=Karate. */
  let ultimoEnvio = null;

  function escapar(texto) {
    const d = document.createElement("div");
    d.textContent = texto;
    return d.innerHTML;
  }

  function simularEnvio() {
    const metodo = (form.getAttribute("method") || "get").toUpperCase();
    const datos = new URLSearchParams(new FormData(form)).toString().replace(/&/g, "\n&");
    ultimoEnvio = {
      metodo,
      texto: metodo === "GET"
        ? "GET " + location.pathname.split("/").pop() + "?" + datos.replace(/\n/g, "")
        : "POST " + location.pathname.split("/").pop() + "\nContent-Type: application/x-www-form-urlencoded\n\n" + datos,
    };
    console.log("Envío simulado:\n" + ultimoEnvio.texto);
  }

  function mostrarMensajeEnvio(tipo, html) {
    mostrarMensaje(tipo, html + `<details class="envio-simulado"><summary>Ver datos enviados (simulación ${ultimoEnvio.metodo})</summary><pre></pre></details>`);
    $("#mensaje pre").textContent = ultimoEnvio.texto;
  }

  function mostrarMensaje(tipo, html) {
    $("#mensaje").innerHTML = `<div class="alert alert-${tipo} mb-0" role="alert">${html}</div>`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const invalidos = campos.filter((n) => !validarCampo(n));
    const faltas = [];
    if (!form.elements.horario.value) faltas.push("elige un horario");
    if (form.elements.nivel && !form.elements.nivel.value) faltas.push("elige tu nivel");
    if (!form.elements.terminos.checked) faltas.push("acepta los términos y condiciones");

    if (invalidos.length || faltas.length) {
      const detalle = faltas.length ? ` Además, ${faltas.join(" y ")}.` : "";
      mostrarMensaje("danger", `Revisa los campos marcados en rojo.${detalle}`);
      if (invalidos.length) form.elements[invalidos[0]].focus();
      return;
    }

    simularEnvio();
    const primerNombre = escapar(form.elements.nombres.value.trim().split(/\s+/)[0]);
    const taller = form.elements.taller ? form.elements.taller.value : "";
    const carrera = form.elements.carrera ? form.elements.carrera.value : "";
    const sede = form.elements.sede ? form.elements.sede.value : "";
    form.reset();
    mostrarMensajeEnvio(
      "success",
      (taller
        ? `Gracias, <strong>${primerNombre}</strong>. Te contactaremos pronto para confirmar tu inscripción al taller de <strong>${taller}</strong>.`
        : `Gracias, <strong>${primerNombre}</strong>. Te contactaremos pronto con información de <strong>${carrera}</strong> en la sede <strong>${sede}</strong>.`)
    );
  });

  form.addEventListener("reset", () => {
    $$(".is-invalid", form).forEach(limpiarError);
    $("#mensaje").innerHTML = "";
  });
})();


/* ===== Script de talleres.html ===== */
(function () {
  "use strict";

  // Al llegar desde el menú (ej. talleres.html#karate), centra la tarjeta elegida en pantalla
  function centrarTarjeta() {
    const destino = location.hash && document.querySelector(location.hash);
    if (destino && destino.matches(".taller")) {
      destino.scrollIntoView({ block: "center" });
    }
  }
  window.addEventListener("load", centrarTarjeta);
  window.addEventListener("hashchange", centrarTarjeta);
})();

/* Inscripción a talleres: el botón de cada tarjeta elige ese taller en el formulario */
(function () {
  "use strict";
  const select = document.querySelector("#taller");
  if (!select) return;

  document.querySelectorAll("[data-taller]").forEach((boton) => {
    boton.addEventListener("click", () => {
      select.value = boton.dataset.taller;
      select.dispatchEvent(new Event("input"));
    });
  });

  const delUrl = new URLSearchParams(location.search).get("taller");
  if (delUrl) select.value = delUrl;
})();