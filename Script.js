// Función auxiliar para esperar que un elemento aparezca en el DOM
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout: no se encontró "${selector}"`));
    }, timeout);
  });
}

// Función auxiliar para buscar un elemento por texto visible
function findElementByText(tag, text) {
  return [...document.querySelectorAll(tag)].find(el =>
    el.textContent.trim() === text
  );
}

// Función principal
async function automatizarEncuesta() {
  for (let i = 1; i <= 33; i++) {
    console.log(`Iteración ${i} de 33...`);

    try {
      // 1. Buscar y hacer click en "-Seleccione-"
      await waitForElement("select");
      const selects = document.querySelectorAll("select");
      const selectActual = [...selects].find(s =>
        s.options[s.selectedIndex]?.text.includes("-Seleccione-")
      );

      if (!selectActual) throw new Error("No se encontró el select con '-Seleccione-'");

      // 2. Seleccionar "Siempre o Muy Bueno"
      const opcionDeseada = [...selectActual.options].find(o =>
        o.text.includes("Siempre o Muy Bueno")
      );

      if (!opcionDeseada) throw new Error("No se encontró la opción 'Siempre o Muy Bueno'");

      selectActual.value = opcionDeseada.value;
      selectActual.dispatchEvent(new Event("change", { bubbles: true }));

      // Pequeña pausa para que la UI reaccione
      await new Promise(r => setTimeout(r, 300));

      // 3. Buscar y hacer click en ">>"
      const botonSiguiente = findElementByText("button", ">>")
        || findElementByText("input[type='button']", ">>")
        || [...document.querySelectorAll("button, input[type='button'], a")].find(el =>
            el.textContent.trim() === ">>" || el.value === ">>"
          );

      if (!botonSiguiente) throw new Error("No se encontró el botón '>>'");

      botonSiguiente.click();

      // Esperar a que la página cargue el siguiente elemento
      await new Promise(r => setTimeout(r, 800));

    } catch (error) {
      console.error(`Error en iteración ${i}:`, error.message);
      break;
    }
  }

  console.log("✅ Proceso completado.");
}

// Ejecutar
automatizarEncuesta();
