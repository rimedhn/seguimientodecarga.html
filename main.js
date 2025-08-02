const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT2NZX6l8bAhCvsjPDuePigHCn9AHdNfB-kEutAd71VHhXmp_QdteAe75f8aWS_kENkn50QvymDysHV/pub?gid=1157701279&single=true&output=csv";

function csvToJson(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        let obj = {};
        headers.forEach((h, i) => {
            obj[h.trim()] = values[i] ? values[i].trim() : '';
        });
        return obj;
    });
}

function detallesToList(detalles) {
    if (!detalles) return '<li>No hay productos registrados.</li>';
    return detalles.split(',').map(item => `<li>${item.trim()}</li>`).join('');
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
            const data = csvToJson(csv);
            const envio = data.find(row => row['Guía'] === guide);
            if (envio) {
                document.getElementById('result').innerHTML = `
                  <div class="col-md-8">
                    <div class="card shadow border-success">
                      <div class="card-header bg-success text-white">
                        <h5>Información del envío</h5>
                      </div>
                      <div class="card-body">
                        <p><strong>Guía:</strong> ${envio['Guía']}</p>
                        <p><strong>Quien envía:</strong> ${envio['Quien envía']}</p>
                        <p><strong>Quien recibe:</strong> ${envio['Cliente']}</p>
                        <p><strong>Origen:</strong> ${envio['Origen']}</p>
                        <p><strong>Destino:</strong> ${envio['Destino']}</p>
                        <p><strong>Estado:</strong> <span class="badge bg-info">${envio['Estado']}</span></p>
                        <p><strong>Fecha Estimada de Entrega:</strong> ${envio['Fecha Entrega']}</p>
                        <p><strong>Productos en la carga:</strong></p>
                        <ul>
                            ${detallesToList(envio['Detalles'])}
                        </ul>
                      </div>
                    </div>
                  </div>`;
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
