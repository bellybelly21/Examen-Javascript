const botonConvertir = document.getElementById('botonConvertir');
let graficoLinea;

async function obtenerConversion(moneda, monto) {
    try {
        const divResultado = document.getElementById('resultado');
        let urlAPI;
        
        if (moneda === 'dolar') {
            urlAPI = 'https://mindicador.cl/api/dolar';
        } else if (moneda === 'euro') {
            urlAPI = 'https://mindicador.cl/api/euro';
        } else if (moneda === 'uf') {
            urlAPI = 'https://mindicador.cl/api/uf';
        } else if (moneda === 'utm') {
            urlAPI = 'https://mindicador.cl/api/utm';
        } else {
            throw new Error('Moneda no válida');
        }
        
        const respuesta = await fetch(urlAPI);
        
        if (!respuesta.ok) {
            throw new Error('No se pudo obtener los datos del API');
        }
        
        const datos = await respuesta.json();
        const tasaConversion = datos.serie[0].valor;
        const montoConvertido = (monto / tasaConversion).toFixed(2);
        
        divResultado.innerHTML = `
            <div class="box">
                <p><strong>Valor actual de ${datos.nombre}:</strong> ${tasaConversion}</p>
                <p><strong>${monto} CLP equivalen a ${montoConvertido} ${datos.nombre}</strong></p>
            </div>
        `;
        
        return datos;
    } catch (error) {
        console.error('Error:', error.message);
        const divError = document.getElementById('error'); 
        divError.innerHTML = `<div class="notification">Lo siento, ha ocurrido un error: ${error.message}</div>`;
    }
}

async function mostrarGrafico(moneda, monto) {
    const datos = await obtenerConversion(moneda, monto);
    if (!datos) return; 
    
    const configuracion = crearConfiguracionGrafico(datos, moneda);
    const contenedorGrafico = document.querySelector(".grafica");
    contenedorGrafico.style.display = 'block';
    
    if (graficoLinea) {
        graficoLinea.destroy();
    }
    
    const graficoDOM = document.getElementById("miGrafico");
    graficoLinea = new Chart(graficoDOM, configuracion);
}

function crearConfiguracionGrafico(datos, moneda) {
    const fechas = [];
    const valores = [];
    
    for (let i = 0; i < 10; i++) {
        fechas.unshift(datos.serie[i].fecha);
        valores.unshift(datos.serie[i].valor);
    }
    
    return {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [{
                label: `Valor ${datos.nombre} en los últimos 10 días`,
                backgroundColor: 'black',
                data: valores
            }]
        }
    };
}

botonConvertir.addEventListener('click', () => {
    const moneda = document.getElementById('moneda').value;
    const inputMonto = document.getElementById('monto');
    const monto = inputMonto.value.replace(/\./g, '');
    
    if (monto.trim() !== '' && monto != 0) {
        mostrarGrafico(moneda, monto);
    }
});