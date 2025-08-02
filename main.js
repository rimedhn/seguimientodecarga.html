const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT2NZX6l8bAhCvsjPDuePigHCn9AHdNfB-kEutAd71VHhXmp_QdteAe75f8aWS_kENkn50QvymDysHV/pub?gid=1157701279&single=true&output=csv";

// Convierte detalles a lista, mejorando la separación
function detallesToList(detalles) {
    if (!detalles) return '<li>No hay productos registrados.</li>';
    // Soporta: coma, punto y coma, salto de línea
    const productos = detalles.split(/,|;|\n/).map(item => item.trim()).filter(Boolean);
    if (productos.length === 0) return '<li>No hay productos registrados.</li>';
    return productos.map(item => `<li>${item}</li>`).join('');
}

document.getElementById('trackingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const guide = document.getElementById('guideNumber').value.trim();
    document.getElementById('result').innerHTML = '<div class="text-center"><div class="spinner-border"></div> Buscando...</div>';

    fetch(SHEET_CSV_URL)
        .then(response => {
            if (!response.ok) throw new Error('No se pudo acceder a los datos');
            return response.text();
        })
        .then(csv => {
            // Papaparse para leer el CSV correctamente
            const data = Papa.parse(csv, { header: true }).data;
            const envio = data.find(row => row['Guía'] === guide);
            if (envio) {
                document.getElementById('result').innerHTML = `
                  <div class="col-12 col-lg-10 d-flex flex-column flex-lg-row gap-3 justify-content-center align-items-stretch">
                    <!-- Tarjeta datos generales -->
                    <div class="card shadow border-success datos-card flex-fill mb-3 mb-lg-0">
                      <div class="card-header bg-success text-white">
                        <h5>Datos Generales</h5>
                      </div>
                      <div class="card-body d-flex flex-column justify-content-between h-100">
                        <div>
                          <p><strong>Guía:</strong> ${envio['Guía']}</p>
                          <p><strong>Quien envía:</strong> ${envio['Quien envía']}</p>
                          <p><strong>Quien recibe:</strong> ${envio['Cliente']}</p>
                          <p><strong>Origen:</strong> ${envio['Origen']}</p>
                          <p><strong>Destino:</strong> ${envio['Destino']}</p>
                          <p><strong>Estado:</strong> <span class="badge bg-info">${envio['Estado']}</span></p>
                          <p><strong>Fecha de recibido:</strong> ${envio['Fecha Entrega']}</p>
                        </div>
                      </div>
                    </div>
                    <!-- Tarjeta detalle de productos -->
                    <div class="card shadow border-info productos-card flex-fill">
                      <div class="card-header bg-info text-white">
                        <h5>Productos en la carga</h5>
                      </div>
                      <div class="card-body h-100">
                        <ul class="detalles-lista">
                            ${detallesToList(envio['Detalles'])}
                        </ul>
                      </div>
                    </div>
                  </div>
                `;
            } else {
                document.getElementById('result').innerHTML = `
                  <div class="col-md-6">
                    <div class="alert alert-danger text-center">
                      No se encontró información para la guía ingresada.
                    </div>
                  </div>`;
            }
        })
        .catch(error => {
            document.getElementById('result').innerHTML = `
              <div class="col-md-6">
                <div class="alert alert-warning text-center">
                  Error al consultar los datos. Intente nuevamente más tarde.
                </div>
              </div>`;
        });
});
