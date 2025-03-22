let workbook = XLSX.utils.book_new();
let headers = ["Nombre", "Tiempo de trabajo", "AFP", "RUT", "Fecha Actual", "id_edificio", "Nacionalidad", "Fecha de Nacimiento", "Domicilio", "Comuna", "Correo", "Remuneración", "Fondo de Salud", "Cuenta Bancaria", "Fecha Inicio de Contrato", "Tipo de Trabajo", "Días trabajo", "Tipo turno", "Horario"];
let worksheet_data = [];
let buildings = [];
let editBuildingIndex = -1;

// Inicialización cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos de LocalStorage si existen
    if (localStorage.getItem("worksheetData")) {
        worksheet_data = JSON.parse(localStorage.getItem("worksheetData"));
    }

    if (localStorage.getItem("buildings")) {
        buildings = JSON.parse(localStorage.getItem("buildings"));
    }

    // Configurar fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("current-date").value = today;
    document.getElementById("contract-start-date").value = today;

    // Actualizar las vistas iniciales
    updateEntries();
    updateBuildingSelect();
    updateBuildingList();

    // Configurar manejadores de eventos para tabs
    setupTabNavigation();
});

// Función para configurar la navegación entre pestañas
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todos los tabs y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Activar el tab seleccionado
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Función para actualizar LocalStorage
function updateLocalStorage() {
    localStorage.setItem("worksheetData", JSON.stringify(worksheet_data));
    localStorage.setItem("buildings", JSON.stringify(buildings));
}

// Función para actualizar la vista de entradas
function updateEntries() {
    const entriesDiv = document.getElementById("entries");
    entriesDiv.innerHTML = "";

    if (worksheet_data.length === 0) {
        entriesDiv.innerHTML = '<p class="no-data">No hay contratos registrados. Cree uno nuevo en la pestaña "Nuevo Contrato".</p>';
        return;
    }

    worksheet_data.forEach((entry, index) => {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("entry");
        
        const building = buildings.find(b => b.id === parseInt(entry[5]));
        
        const entryInfo = document.createElement("div");
        entryInfo.classList.add("entry-info");
        entryInfo.innerHTML = `
            <h3>${entry[0]}</h3>
            <p><strong>RUT:</strong> ${entry[3]}</p>
            <p><strong>Edificio:</strong> ${building ? building.name : 'N/A'}</p>
            <p><strong>Tipo de Trabajo:</strong> ${entry[15] === 'conserje' ? 'Conserje' : 'Auxiliar de Aseo'}</p>
            <p><strong>Fecha Inicio:</strong> ${entry[14]}</p>
        `;

        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("entry-actions");

        // Botón descargar Word
        const downloadWordBtn = document.createElement("button");
        downloadWordBtn.classList.add("download-btn");
        downloadWordBtn.innerHTML = '<i class="fas fa-file-word"></i> Descargar Word';
        downloadWordBtn.addEventListener("click", () => {
            downloadWordDocument(entry);
        });

        // Botón eliminar
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
        deleteBtn.addEventListener("click", () => {
            if (confirm("¿Está seguro que desea eliminar este contrato?")) {
                worksheet_data.splice(index, 1);
                updateLocalStorage();
                updateEntries();
            }
        });

        // Agregar botones al div de acciones
        actionsDiv.appendChild(downloadWordBtn);
        actionsDiv.appendChild(deleteBtn);
        
        entryDiv.appendChild(entryInfo);
        entryDiv.appendChild(actionsDiv);
        entriesDiv.appendChild(entryDiv);
    });
}

// Función para actualizar la lista de edificios en el select
function updateBuildingSelect() {
    const buildingSelect = document.getElementById("building");
    buildingSelect.innerHTML = "";
    buildings.forEach((building, index) => {
        const option = document.createElement("option");
        option.value = building.id;
        option.textContent = building.name;
        buildingSelect.appendChild(option);
    });
}

// Función para descargar el documento Word
function downloadWordDocument(entry) {
    const { Document,Table,TableCell,TableRow,TextRun,WidthType , Packer, Paragraph, AlignmentType, BorderStyle  } = window.docx;

    const building = buildings.find(b => b.id === parseInt(entry[5]));

    let contractText = "";

    if (entry[15] === "conserje") {
        contractText = [
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "CONTRATO DE TRABAJO",
                        bold: true,
                        font: "Arial",
                        size: 20,
                        underline: {},
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `En Santiago, a ${entry[4]} entre Edificio ${building ? building.name : 'N/A'}, ${building ? building.rut : 'N/A'}, representada por ${building ? building.representative : 'N/A'}, Administrador, cédula nacional de identidad ${building ? building.representativeRut : 'N/A'}, ambos con domicilio en ${building ? building.address : 'N/A'}, en la comuna de ${building ? building.comuna : 'N/A'}, en adelante EL EMPLEADOR, y ${entry[0]} Cédula de Identidad N° ${entry[3]}, de nacionalidad ${entry[6]}, nacido el ${entry[7]}, domiciliado en ${entry[8]}, comuna de ${entry[9]}, ciudad Santiago, correo electrónico ${entry[10]} en adelante EL/LA TRABAJADOR/A, se ha convenido el presente Contrato de Trabajo:`,
                        font: "Arial",
                        size: 20,
                    }),
                ],
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "PRIMERO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `EL/LA TRABAJADOR/A se obliga a prestar servicios personales en calidad de “Conserje” en el Edificio ${building ? building.name: 'N/A'}, ubicado en ${building ? building.address : 'N/A'}, en la comuna de ${building ? building.comuna: 'N/A'}. Sin perjuicio de lo anterior, y de conformidad con lo establecido en el Art. 12 y Art. 38 del Código del trabajo, en cuanto a que el empleador podrá alterar la naturaleza de los servicios o el sitio o recinto en que ellos deban prestarse.`,
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
        
            new Paragraph({ text: "\n" }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: "EL/LA TRABAJADOR/A estará subordinado directamente al mayordomo y administrador del condominio, quienes serán su superior directo. Recibirá instrucciones del mayordomo y administrador de la comunidad, como también, por los integrantes del Comité de Administración individual o colectivamente.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "SEGUNDO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `Jornada de trabajo. La jornada de trabajo, de acuerdo con el artículo 38 inciso número 4 del código del trabajo, que especifica su carácter necesario e impostergables para la buena marcha del condominio, será de ${entry[16]}, en turnos ${entry[17]}, la jornada de trabajo será distribuida en el siguiente horario: ${entry[18]}, dentro de la cual tendrá derecho a un lapso de 30 minutos para destinarlo a colación las que no serán imputables a la jornada laboral.`,
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "El tiempo destinado a las actividades de cambio de vestuario, uso de elementos de protección y/o aseo personal no constituyen parte integrante de la jornada de trabajo. Así mismo, tampoco constituye jornada de trabajo el periodo que EL/LA TRABAJADOR/A permanece antes de la hora de iniciación o posterior al término de jornada en las dependencias del TRABAJADOR/A por razones personales. EL/LA TRABAJADOR/A deberá realizar sus funciones en el turno que el empleador le asigne, el cual podrá ser modificado previo aviso a EL/LA TRABAJADOR/A.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Las horas extras solo podrán pactarse para atender necesidades o situaciones temporales de la empresa. Dichos pactos deberán acordarse solo por escrito y tener una vigencia transitoria no superior a tres meses, pudiendo renovarse por acuerdos de las partes. No obstante, a la falta de pacto escrito, se considerarán extraordinarias las horas que se trabajan en exceso de la jornada pactada, con conocimiento expreso del empleador.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "TERCERO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `Remuneración. El empleador se compromete a remunerar a EL/LA TRABAJADOR/A con la suma de ${entry[11]}. Mensual como sueldo base en moneda de curso legal. Además, se incluirán las asignaciones de movilización por $46.000 mensuales y colación de $46.000 mensuales, proporcionales a los días efectivamente trabajados. Estas asignaciones se pagarán junto a su remuneración mensual.`,
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Por otra parte, se considera un bono de Puntualidad adicional a la remuneración convenida, el que se otorgará al EL/LA TRABAJADOR/A de la forma y según los siguientes requisitos:",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Se pagará el valor de $50.000 imponibles mensuales siempre y cuando el EL/LA TRABAJADOR/A tenga menos de 30 minutos de atrasos acumulados durante el mes. Este cálculo estará sujeto a los días efectivamente trabajados.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Se pagará el valor de $25.000 imponibles mensuales siempre y cuando el EL/LA TRABAJADOR/A tenga entre 31 y 59 minutos de atrasos acumulados durante el mes. Este cálculo estará sujeto a los días efectivamente trabajados.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "No se pagará el bono de Puntualidad cuando supere los 60 minutos de atrasos acumulados durante el mes.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "La remuneración se pagará por periodos vencidos, el día 05 del mes siguiente. Sin perjuicio de lo anterior, la empresa queda expresamente facultada para pagar las remuneraciones y demás asignaciones en cheque o mediante abono deposito o transferencia electrónica de fondos a la cuenta bancaria (cuenta RUT, cuenta a la vista o cuenta corriente) que EL/LA TRABAJADOR/A mantenga abierta a su nombre y del monto de ellas el empleador hará las deducciones que establezcan las leyes previsionales vigentes.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "EL/LA TRABAJADOR/A, por su parte, acepta y autoriza al empleador para que le descuente el tiempo efectivamente no trabajado debido a atrasos, inasistencias y permisos.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "No habrá otra remuneración ni pago adicional por concepto de asignaciones ni bonificaciones de ninguna especie, salvo las establecidas por ley que afecten obligatoriamente a LA EMPRESA, de manera que con el pago de las remuneraciones y prestaciones indicadas en los párrafos anteriores se entenderá íntegramente cumplida la obligación de LA EMPRESA a este respecto y cualquier asignación o bonificación adicional que ella otorgare a EL/LA TRABAJADOR/A, aunque que fuere con regularidad, se considerará voluntaria y no podrá ser exigida por EL/LA TRABAJADOR/A.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
                    
            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "CUARTO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: "Obligaciones. Serán obligaciones específicas del TRABAJADOR/A las siguientes:",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
                    
            new Paragraph({ text: "\n" }),
                 
            new Paragraph({
                children: [
                    new TextRun({
                        text: "FUNCIONES. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    
                ],
            }),

            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "1. Control y apertura del acceso peatonal y vehicular al edificio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "2. Verificar que las puertas de ingreso peatonal y portones de entrada de vehículos permanezcan cerradas en todo momento ",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "3. Velar por la seguridad interna del edificio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "4. Deberá mantener una constante vigilancia, manteniendo un estricto control con las personas que ingresan al edificio, registrando en los libros correspondientes los datos de nombre, RUT, unidad donde se dirige y hora de ingreso y salida.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "5. Deberá registrar todos los autos que ocupen los estacionamientos de visitas con el nombre del conductor, RUT, patente del auto, hora de ingreso y departamento que visita. A su vez, deberá controlar el tiempo de ocupación de todos los estacionamientos de visita e informar al mayordomo o administración aquellos que superen las horas estipuladas en el Reglamento Interno de la comunidad.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "6. Recibir la correspondencia de propietarios / arrendatarios, y colocarla en los casilleros respectivos, salvo las notificaciones notariales, cartas judiciales, documentos importantes o dinero, quien será responsabilidad del propietario o arrendatario la recepción de este tipo de correspondencia.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "7. Procurar la tranquilidad general del edificio, haciendo cumplir las disposiciones estipuladas en la Ley de Copropiedad 21.442, el Reglamento Interno del edificio, las disposiciones de la legislación laboral, de las disposiciones sanitarias, del reglamento interno de trabajadores, del Plan de Emergencia Ante Siniestros (P.E.S.), de las normas emanadas de la asamblea de copropietarios, del comité de administración y de la administración; de las resoluciones judiciales pertinentes y cualquier otra disposición legal que involucre a los condominios.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "8. Controlar el buen funcionamiento de los equipos del edificio e informar a su superior directo cualquier inconveniente que presentes.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "9. Controlar las cámaras de vigilancia e informar al mayordomo y/o administración ante cualquier irregularidad presentada en el edificio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "10. Contestar el teléfono de la comunidad.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "11. Registrar todos los acontecimientos relevantes en el libro de novedades (bitácora).",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "12. Recibir cuentas, facturas y entregar exclusivamente a la administración, comité de administración y/o mayordomo.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "13. Rescatar en primera instancia a las personas si quedan atrapadas en el ascensor.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "14. En caso de emergencia, liderar la evacuación y ayudar a los demás en caso de siniestros.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "15. Realizar rondas de vigilancia, registrando en el libro de actas la hora y observaciones encontradas.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "16. Cambiar tachos de basura y disponerlos para retiro de camión recolector.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "17. Realizar riego en jardines del condominio según las indicaciones de sus superiores.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "18. Mantener la conserjería aseada y limpia.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "19. Asistir y participar de las reuniones de coordinación o capacitación que se les indique.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "20. Mantener al alcance y en perfecto estado la siguiente documentación: registro de teléfonos de emergencia, registro de propietarios y usuarios de cada unidad o inmueble, libro de novedades, libro de sugerencia o reclamos, libro de control de asistencia de trabajadores, libro de control de visitas y uso de estacionamientos, reglamento de copropiedad.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "21. Supervisará las mudanzas y revisa si se provocan destrozos en espacios comunes que deban cargarse al gasto común al residente.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "22. Todas las funciones e instrucciones dictadas en el reglamento interno del edificio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
                    
            new Paragraph({ text: "\n" }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: "OBLIGACIONES. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    
                ],
            }),

            new Paragraph({ text: "\n" }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "23. EL/LA TRABAJADOR/A deberá firmar o marcar en reloj control la entrada del turno, salida y retorno de colación y al terminar la jornada laboral. Al entregar el turno, se debe informar cualquier anomalía, recado o problema que se haya suscitado durante su jornada de trabajo al funcionario que entra al turno. Además, deberá consignar por escrito en el libro de novedades tales comunicaciones.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "24. Deberá leer diariamente el libro de actas, con el objeto de tomar conocimiento y ejecutar las instrucciones que se encomienden.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "25. En caso de personas que vengan a realizar trabajos o visiten un departamento, deberá preocuparse que el acceso sea autorizado desde el departamento que lo ha requerido. Dicha autorización deberá consignar la hora de ingreso y salida, cédula de identidad o credencial y la placa patente, en caso de que el ingreso sea en vehículo, consignando tales datos en el libro de novedades.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "26. Deberá mantener una actitud amable, respetuosa hacia los copropietarios y visitas.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "27. Deberá dejar constancia escrita en el libro de novedades, de cualquier hecho anormal, identificando a la o las personas y/o vehículos involucrados.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "28. En caso de emergencia, deberá avisar a la brevedad al mayordomo o administración, a fin de dar una solución al problema. En caso de que no exista comunicación con uno de los involucrados antes mencionados, en última instancia se notificará al comité de administración.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "29. Deberá mantener su OS10 al día.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "30. Deberá mantener limpio y aseado su lugar de trabajo, así como las salas, baños y comedores del personal.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "31. Informar cambio de domicilio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "32. Mantener la confidencialidad de los reclamos de los residentes.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),

            new Paragraph({ text: "\n" }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: "PROHIBICIONES. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    
                ],
            }),

            new Paragraph({ text: "\n" }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: "33. Ausentarse del lugar de trabajo durante su jornada, sin autorización previa por parte del mayordomo o el administrador o negarse a trabajar sin causa justificada. Faltar injustificadamente o sin aviso previo.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "34. Llegar atrasado a su lugar de trabajo.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "35. Permitir el ingreso o la permanencia en el condominio de personas no autorizadas, salvo que el departamento indique lo contrario. ",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "36. Ocupar su tiempo de trabajo en actividades ajenas a sus funciones.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "37. Suministrar a cualquier persona no autorizada información interna del condominio, su funcionamiento o sus departamentos.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "38. Abandonar su puesto de trabajo, salvo emergencias de fuerza mayor justificadas. ",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "39. Retirarse si por cualquier causa no llega su relevo, sin avisar al mayordomo o administración.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "40. Fumar, beber, consumir o vender alcohol, drogas o cualquier tipo de estupefaciente dentro del edificio y sus alrededores",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "41. Ingresar es estado de ebriedad o drogas.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "42. Dormir en el puesto de trabajo o en cualquier otra dependencia del condominio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "43. Comer en el puesto de trabajo sin autorización previa del mayordomo o administración.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "44. Usar un lenguaje inadecuado o participar de acciones obscenas, inmorales o reñidos con la moral y las buenas costumbres. ",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "45. Portar o emplear armas de fuego. ",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "46. No informar de sus cambios de antecedentes personales (domicilio, teléfono de contacto, etc.)",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "47. Descuidar su presencia personal, su higiene o no utilizar su uniforme adecuadamente.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "48. Autorizar la mudanza de departamentos sin autorización del mayordomo o administración.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "49. Autorizar la ocupación de los estacionamientos de visita por más tiempo de lo estipulado en el reglamento interno, así como arrendar o facilitar cualquiera de los estacionamientos disponibles en el edificio sin previa autorización del comité o administración.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "50. Queda estrictamente prohibido el acceso a vendedores o repartidores de servicios de cualquier tipo sin autorización previa del departamento visitado. En caso de que una de estas personas haya sido requerida por un residente deberá identificarlo, solicitando y registrando nombre, cédula de identidad o credencial, hora de ingreso y departamento visitado.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "51. Permitir el ingreso al sector de conserjería a cualquier persona que no sea mayordomo, administrador o comité de administración.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "52. Recibir dineros, objetos de valor o llaves de parte de los residentes sin que estos vengan en un sobre cerrado.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "53. Adulterar, borrar o modificar el libro de asistencia.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "54. Entregar información personal de los residentes.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),

            
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "55. Facilitar los libros de novedades o bitácoras de conserjería a cualquier residente o persona externa al edificio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "56. Entregar grabaciones de cámaras a cualquier residente o persona externa al edificio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "57. Permitir el ingreso de menores de edad a conserjería o espacios utilizados por funcionarios (salas, comedores, baños, entre otros.)",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),

            new Paragraph({ text: "\n" }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: "QUINTO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: "Finiquito y terminación. Si EL/LA TRABAJADOR/A no cumple fielmente las obligaciones que impone este contrato, en cuanto a su cometido específico y a sus normas de general aplicación, el empleador podrá poner término al contrato de trabajo, de acuerdo con lo establecido en la ley vigente, sin perjuicio de las demás causales generales que la misma establece. A la fecha de término de este contrato de trabajo se otorgará el finiquito correspondiente, el cual deberá ser firmado por ambas partes y ratificado ante un ministro de fe, el que consignará el saldo del periodo trabajado y se hará efectivo dentro de un plazo de 10 días hábiles siguientes a la fecha de término de la relación laboral.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
    

            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "SEXTO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `Se deja constancia de que EL/LA TRABAJADOR/A declara estar afiliado a la institución previsional de salud ${entry[12]}. Se deja constancia de que EL/LA TRABAJADOR/A realizaciones en AFP siendo esta ${entry[2]}. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            
           
            new Paragraph({ text: "\n" }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: "SEPTIMO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `EL/LA TRABAJADOR/A autoriza a realizar los depósitos de remuneraciones a la ${entry[13]}. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),

           
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "OCTAVO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `Se deja expresa constancia que EL/LA TRABAJADOR/A ingreso al servicio el día ${entry[14]}. El presente contrato fijo tendrá una vigencia de ${entry[1]} a partir de la fecha de ingreso al servicio. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `EL/LA TRABAJADOR/A declara estar en conocimiento que la infracción de las normas contenidas en el reglamento interno de la empresa podría ser considerada como incumplimiento grave de las obligaciones que le impone el contrato, dando derecho al empleador a poner término inmediato al mismo en virtud de lo establecido en el artículo 160º Número 7 del Código del Trabajo. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `El presente contrato de trabajo se extiende en 2 ejemplares, quedando uno de ellos en poder de EL/LA TRABAJADOR/A, otro en poder del empleador, todos ellos debidamente firmados y recibidos en este acto. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            
            new Paragraph({
                text: "Las partes firman en señal de aceptación.",
                font: "Arial",
                size: 20,
                spacing: { after: 400 },
            }),
            
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Table({
                width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "FIRMA TRABAJADOR/A",
                                                bold: true,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${entry[0]}`,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${entry[3]}`,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],

                                borders: {
                                    top: { style: BorderStyle.NONE },
                                    bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE },
                                },
                                width: {
                                    size: 50,
                                    type: WidthType.PERCENTAGE,
                                },
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "FIRMA EMPLEADOR",
                                                bold: true,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${building ? building.name : 'N/A'}`,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${building ? building.rut : 'N/A'}`,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],

                                borders: {
                                    top: { style: BorderStyle.NONE, },
                                    bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE },
                                },
                                width: {
                                    size: 50,
                                    type: WidthType.PERCENTAGE,
                                },
                            }),
                        ],
                    }),
                    
                    ],
                    borders: {
                        top: { style: BorderStyle.NONE},
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    },
                   
                }),




        ];
    } else if (entry[15] === "auxiliar") {
        contractText = [
            new Paragraph({
                text: "CONTRATO DE TRABAJO",
                style: "title",
                font: "Arial",
                size: 10,
            }),
            new Paragraph({ text: "\n" }),
            new Paragraph({
                text: `En Santiago, a ${entry[4]} entre Edificio ${building ? building.name : 'N/A'}, Rut: ${building ? building.rut : 'N/A'}, representada por  ${building ? building.representative : 'N/A'}, cédula nacional de identidad ${building ? building.representativeRut : 'N/A'}, ambos con domicilio en ${building ? building.address : 'N/A'}, en la comuna de ${building ? building.comuna : 'N/A'}, en adelante EL EMPLEADOR, ${entry ? entry[0] : 'N/A'} cédula de identidad ${entry[3]}, de nacionalidad ${entry[6]}, nacido el ${entry[7]}, domiciliado en ${entry[8]}, comuna ${entry[9]}, ciudad Santiago, correo electrónico ${entry[10]} en adelante EL/LA TRABAJADOR/A, se ha convenido el presente Contrato de Trabajo:`,
                style: "normal",
                
            }),
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "PRIMERO. Cargo y lugar de trabajo. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `Cargo y lugar de trabajo. Por el presente instrumento EL/LA TRABAJADOR/A, se obliga a prestar servicios personales en calidad de “Auxiliar de aseo” en el Edificio ${building ? building.name: 'N/A'}, tanto el sector residencial como el sector de locales comerciales, así como también en aquellos lugares que se le asigne, o a los cuales deba desplazarse por la naturaleza de su trabajo para dar cumplimiento a las gestiones que se encomienden, todo conforme a la legislación vigente. `,
                        style: "normal",
                        font: "Arial",
                        size: 20,
                        
                    }),
                    new TextRun({
                        text: "Sin perjuicio de lo anterior, y de conformidad con lo establecido en el Art. 12 del Código del trabajo, en cuanto a que el empleador podrá alterar la naturaleza de los servicios o el sitio o recinto en que ellos deban prestarse. ",
                        style: "normal",
                        font: "Arial",
                        size: 20,
                    }),
                    new TextRun({
                        text: "el/La trabajador/a estará subordinado directamente al mayordomo y administrador del condominio, quien serán sus superiores directos.",
                        style: "normal",
                        font: "Arial",
                        size: 20,
                    }),

                ],
            }),
                
                
        
            
            
            
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "SEGUNDO. Jornada de trabajo. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `La jornada de trabajo, de acuerdo con el artículo 38 inciso número 4 del código del trabajo, que especifica su carácter necesario e impostergable para la buena marcha del condominio, será ${entry[16]} de turno ${entry[17]}, distribuido en el siguiente horario: ${entry[18]}, dentro de la cual tendrá derecho a un lapso de 30 minutos para destinarlo a colación las que no serán imputables a la jornada laboral. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: "El tiempo destinado a las actividades de cambio de vestuario, uso de elementos de protección y/o aseo personal no constituyen parte integrante de la jornada de trabajo.  el/la trabajador/a deberá realizar sus funciones en el turno que el empleador le asigne, el cual podrá ser modificado previo aviso a EL/LA TRABAJADOR/A. ",
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: "Las horas extras solo podrán pactarse para atender necesidades o situaciones temporales de la empresa. Dichos pactos deberán acordarse solo por escrito y tener una vigencia transitoria no superior a tres meses, pudiendo renovarse por acuerdos de las partes. No obstante, a la falta de pacto escrito, se considerarán extraordinarias las horas que se trabajan en exceso de la jornada pactada, con conocimiento expreso del empleador.",
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
           
    
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "TERCERO. Remuneración. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `El empleador se compromete a remunerar a EL/LA TRABAJADOR/A con la suma de $ ${entry[11]} como sueldo base en moneda de curso legal. Se definen dos asignaciones: Asignación de Movilización por $42.550 mensual, asignación de Colación por $42.550 mensual. Estos bonos se pagarán junto a la remuneración mensual.`,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            
            new Paragraph({
                text: "La remuneración se pagará por periodos vencidos, el quinto día hábil del mes. Sin perjuicio de lo anterior, la empresa queda expresamente facultada para pagar las remuneraciones y demás asignaciones en cheque o mediante abono deposito o transferencia electrónica de fondos a la cuenta bancaria (cuenta RUT o cuenta a la vista) que EL/LA TRABAJADOR/A mantenga abierta a su nombre y del monto de ellas el empleador hará las deducciones que establezcan las leyes previsionales vigentes. ",
                style: "normal",
                font: "Arial",
                size: 10,
            }),
            new Paragraph({
                text: "EL/LA TRABAJADOR/A, por su parte, acepta y autoriza al empleador para que le descuente el tiempo efectivamente no trabajado debido a atrasos, inasistencias y permisos.",
                style: "normal",
                font: "Arial",
                size: 10,
            }),
            new Paragraph({
                text: "No habrá otra remuneración ni pago adicional por concepto de asignaciones ni bonificaciones de ninguna especie, salvo las establecidas por ley que afecten obligatoriamente a LA EMPRESA, de manera que con el pago de las remuneraciones y prestaciones indicadas en los párrafos anteriores se entenderá íntegramente cumplida la obligación de LA EMPRESA a este respecto y cualquier asignación o bonificación adicional que ella otorgare a EL/LA TRABAJADOR/A, aunque que fuere con regularidad, se considerará voluntaria y no podrá ser exigida por EL/LA TRABAJADOR/A.",
                style: "normal",
                font: "Arial",
                size: 10,
            }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
           
            new Paragraph({
                children: [
                    new TextRun({
                        text: "DESCRIPCION DE CARGO",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "FUNCIONES",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Mantener el edificio en óptimas condiciones de aseo y ornato. Esto implica:",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de plafones o globos de lámparas exteriores.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de Hall Principal y conserjería.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de vidrios de espacios comunes hasta dos metros.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de muebles de espacios comunes.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de las cabinas de ascensores, incluido los paneles superiores, paneles informativos, espejos, luces, botoneras, celosía de ventilación y pasamanos si existieran.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de puertas de shaft de basuras.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Recoger reciclaje de los shafts ecológicos.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text:"Limpieza de shafts eléctricos, gas y agua interior.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Pasamanos de escaleras de caja escala.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de pisos interiores con formato barrer, mopear, secar y abrillantar en todos los pisos.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de puertas y muros.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de la sala de basuras.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Lavado de tachos de basura.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de Shaft de Reciclajes, incluyendo repisas.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Vaciar los tachos de reciclaje en el lugar dispuesto por la municipalidad.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de estacionamientos exteriores y subterráneos pertenecientes al condominio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de zona de quinchos y piscina, incluyendo pisos, muros, manillas, asaderas, barandas, pasamanos, escaleras, implementos y cualquier otro elemento que se incluya en el área.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de baños de todos los espacios comunes.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de gimnasio y maquinas dispuestas en el mismo.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de inmobiliario dispuesto en la comunidad, incluyendo conserjería.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de veredas exteriores del edificio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza zona de locales comerciales.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de sala multiuso, incluyendo muebles, pisos, cocina y baños.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Limpieza de equipos de emergencia (extintores, redes húmedas, gabinetes).",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Velar por la seguridad del condominio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Realizar relevo temporal del conserje en caso de colación o retiro a baño.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "OBLIGACIONES",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "EL/LA TRABAJADOR/A deberá firmar entrada del turno, salida y retorno de colación y al terminar la jornada laboral. Al entregar el turno, se debe informar cualquier anomalía, recado o problema que se haya suscitado durante su jornada de trabajo a la administración. Además, deberá consignar por escrito en el libro de novedades tales comunicaciones.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Deberá mantener una actitud amable, respetuosa hacia los copropietarios y visitas.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "En caso de emergencia, deberá avisar a la brevedad al mayordomo o administración, a fin de dar una solución al problema. En caso de que no exista comunicación con uno de los involucrados antes mencionados, en última instancia se notificará al comité de administración.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Deberá mantener limpio y aseado su lugar de trabajo, así como las salas, baños y comedores del personal.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Informar cambio de domicilio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Mantener la confidencialidad de los reclamos de los residentes.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "PROHIBICIONES",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Ausentarse del lugar de trabajo durante su jornada, sin autorización previa por parte del mayordomo o el administrador o negarse a trabajar sin causa justificada. Faltar injustificadamente o sin aviso previo.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Llegar atrasado a su lugar de trabajo con un margen máximo de 10 minutos.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Ocupar su tiempo de trabajo en actividades ajenas a sus funciones.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Realizar labores de limpieza a departamentos de forma particular.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Suministrar a cualquier persona no autorizada información interna del condominio o sus departamentos.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Abandonar su puesto de trabajo, salvo emergencias de fuerza mayor justificadas.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Fumar, beber alcohol o consumir drogas dentro del edificio y sus alrededores, ingresar en estado de ebriedad, y dormir durante su jornada laboral.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "No utilizar los elementos de EPP mientras realiza labores de riesgo.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Usar un lenguaje inadecuado o participar de acciones obscenas, inmorales o reñidas con la moral y las buenas costumbres.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Portar o emplear armas de fuego. .",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "No informar de sus cambios de antecedentes personales (domicilio, teléfono de contacto, etc.).",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Descuidar su presencia personal, su higiene o no utilizar su uniforme adecuadamente",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Autorizar la ocupación de los estacionamientos de visita por más tiempo de lo estipulado en el reglamento interno, así como arrendar cualquiera de los estacionamientos disponibles en el edificio.",
                        size: 20,
                        font: "Arial",
                    }),
                ],
                bullet: {
                    level: 0,
                },
            }),
            



            new Paragraph({ text: "\n" }),
            new Paragraph({
                text: "Se entienden incorporadas en el presente contrato de trabajo todas las disposiciones legales vigentes conforme a lo señalado en el artículo 12 y 38 del Código del Trabajo.",
                style: "normal",
                font: "Arial",
                size: 20,
            }),
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "QUINTO. De los cambios de domicilio. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `Si EL/LA TRABAJADOR/A cambiase su domicilio, a un lugar distinto del indicado en este contrato, queda obligado a informar, por escrito, esta circunstancia al departamento de personal de la empresa dentro de los dos días siguientes al cambio. En caso contrario, se entenderán válidamente efectuadas todas las notificaciones que se practicaren en el domicilio indicado en este contrato. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            
            
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "SEXTO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `Se deja constancia de que EL/LA TRABAJADOR/A declara estar afiliado a la institución previsional de salud ${entry[12]}. Se deja constancia de que EL/LA TRABAJADOR/A realizaciones en AFP siendo esta ${entry[2]}. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            
           
            new Paragraph({ text: "\n" }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: "SEPTIMO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `EL/LA TRABAJADOR/A autoriza a realizar los depósitos de remuneraciones a la ${entry[13]}. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),

           
            new Paragraph({ text: "\n" }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: "OCTAVO. ",
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `Se deja expresa constancia que EL/LA TRABAJADOR/A ingreso al servicio el día ${entry[14]}. El presente contrato fijo tendrá una vigencia de ${entry[1]} a partir de la fecha de ingreso al servicio. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `EL/LA TRABAJADOR/A declara estar en conocimiento que la infracción de las normas contenidas en el reglamento interno de la empresa podría ser considerada como incumplimiento grave de las obligaciones que le impone el contrato, dando derecho al empleador a poner término inmediato al mismo en virtud de lo establecido en el artículo 160º Número 7 del Código del Trabajo. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: `El presente contrato de trabajo se extiende en 2 ejemplares, quedando uno de ellos en poder de EL/LA TRABAJADOR/A, otro en poder del empleador, todos ellos debidamente firmados y recibidos en este acto. `,
                        style: "normal",
                        size: 20,
                        font: "Arial",
                    }),
                ],
            }),
            
           
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            new Paragraph({ text: "\n" }),
            
            
           
            new Table({
                width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "FIRMA TRABAJADOR/A",
                                                bold: true,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${entry[0]}`,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${entry[3]}`,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],

                                borders: {
                                    top: { style: BorderStyle.NONE },
                                    bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE },
                                },
                                width: {
                                    size: 50,
                                    type: WidthType.PERCENTAGE,
                                },
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "FIRMA EMPLEADOR",
                                                bold: true,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${building ? building.name : 'N/A'}`,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${building ? building.rut : 'N/A'}`,
                                                font: "Arial",
                                                size: 20,
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],

                                borders: {
                                    top: { style: BorderStyle.NONE, },
                                    bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE },
                                },
                                width: {
                                    size: 50,
                                    type: WidthType.PERCENTAGE,
                                },
                            }),
                        ],
                    }),
                    
                    ],
                    borders: {
                        top: { style: BorderStyle.NONE},
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    },
                   
                }),
            ]}

    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "normal",
                    name: "Normal",
                    run: {
                        font: "Arial",
                        size: 20, // 12 points * 2 (for half-point units)
                    },
                    paragraph: {
                        alignment: AlignmentType.JUSTIFIED,
                    },
                },
                {
                    id: "title",
                    name: "Title",
                    run: {
                        font: "Arial",
                        size: 20, // 24 points * 2 (for half-point units)
                        bold: true,
                    },
                    paragraph: {
                        alignment: AlignmentType.CENTER,
                    },
                },
            ],
        },
        sections: [
            {
                properties: {},
                children: contractText,
            },
        ],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${entry[0]}_Contrato.docx`);
    }).catch(error => {
        console.error('Error al crear el documento Word:', error);
    });
}

document.getElementById("add-btn").addEventListener("click", function() {
    const name = document.getElementById("name").value;
    const workTime = document.getElementById("work-time").value;
    const afp = document.getElementById("afp").value;
    const rut = document.getElementById("rut").value;
    const currentDate = document.getElementById("current-date").value;
    const building = document.getElementById("building").value;
    const nationality = document.getElementById("nationality").value;
    const birthDate = document.getElementById("birth-date").value;
    const address = document.getElementById("address").value;
    const comuna = document.getElementById("comuna").value;
    const email = document.getElementById("email").value;
    const salary = document.getElementById("salary").value;
    const healthFund = document.getElementById("health-fund").value;
    const bankAccount = document.getElementById("bank-account").value;
    const contractStartDate = document.getElementById("contract-start-date").value;
    const jobType = document.getElementById("job-type").value;
    const diastrabajo = document.getElementById("dias-trabajo").value;
    const tipoturno = document.getElementById("tipo-turno").value;
    const horario = document.getElementById("horario-x").value;

    if (name && workTime && afp && rut && currentDate && building && nationality && birthDate && address && comuna && email && salary && healthFund && bankAccount && contractStartDate && jobType && diastrabajo && tipoturno && horario) {
        worksheet_data.push([name, workTime, afp, rut, currentDate, building, nationality, birthDate, address, comuna, email, salary, healthFund, bankAccount, contractStartDate, jobType, diastrabajo, tipoturno, horario]);
        document.getElementById("name").value = "";
        document.getElementById("work-time").value = "";
        document.getElementById("afp").value = "";
        document.getElementById("rut").value = "";
        document.getElementById("current-date").value = new Date().toISOString().split('T')[0];
        document.getElementById("nationality").value = "";
        document.getElementById("birth-date").value = "";
        document.getElementById("address").value = "";
        document.getElementById("comuna").value = "";
        document.getElementById("email").value = "";
        document.getElementById("salary").value = "";
        document.getElementById("health-fund").value = "";
        document.getElementById("bank-account").value = "";
        document.getElementById("contract-start-date").value = new Date().toISOString().split('T')[0];
        document.getElementById("job-type").value = "conserje";
        document.getElementById("dias-trabajo").value = "";
        document.getElementById("tipo-turno").value = "";
        document.getElementById("horario-x").value = "";
        updateLocalStorage();
        updateEntries();
        
        // Cambiar a la pestaña de contratos generados automáticamente
        const entriesTabBtn = document.querySelector('[data-tab="entries-tab"]');
        if (entriesTabBtn) {
            entriesTabBtn.click();
        }
        
        alert("Contrato agregado exitosamente.");
    } else {
        alert("Por favor, complete todos los campos.");
    }
});

document.getElementById("download-excel-btn").addEventListener("click", function() {
    let worksheet = XLSX.utils.aoa_to_sheet([headers, ...worksheet_data]);
    workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "archivo.xlsx");
});
// Funciones para el modal
document.getElementById("add-building-btn").addEventListener("click", function() {
    document.getElementById("building-modal").style.display = "block";
});

document.querySelector(".close").addEventListener("click", function() {
    document.getElementById("building-modal").style.display = "none";
});

function updateBuildingList() {
    const buildingList = document.getElementById("building-list");
    buildingList.innerHTML = "";

    if (buildings.length === 0) {
        buildingList.innerHTML = '<p class="no-data">No hay edificios registrados. Agregue uno con el botón "Agregar Edificio".</p>';
        return;
    }

    buildings.forEach((building, index) => {
        const buildingDiv = document.createElement("div");
        buildingDiv.classList.add("entry");

        const buildingInfo = document.createElement("div");
        buildingInfo.classList.add("entry-info");
        buildingInfo.innerHTML = `
            <h3>${building.name}</h3>
            <p><strong>RUT:</strong> ${building.rut}</p>
            <p><strong>Dirección:</strong> ${building.address}, ${building.comuna}</p>
            <p><strong>Representante:</strong> ${building.representative} (${building.representativeRut})</p>
        `;
        
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("entry-actions");
        
        // Botón editar
        const editBtn = document.createElement("button");
        editBtn.classList.add("edit-btn");
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
        editBtn.addEventListener("click", () => {
            document.getElementById("building-modal").style.display = "block";
            document.getElementById("building-modal-title").textContent = "Editar Edificio";
            document.getElementById("building-name").value = building.name;
            document.getElementById("building-address").value = building.address;
            document.getElementById("building-representative").value = building.representative;
            document.getElementById("building-rut").value = building.rut;
            document.getElementById("building-representative-rut").value = building.representativeRut;
            document.getElementById("building-comuna").value = building.comuna;
            editBuildingIndex = index;
        });

        // Botón eliminar
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
        deleteBtn.addEventListener("click", () => {
            if (confirm("¿Está seguro que desea eliminar este edificio?")) {
                // Verificar si el edificio está en uso
                const inUse = worksheet_data.some(entry => parseInt(entry[5]) === building.id);
                
                if (inUse) {
                    alert("No se puede eliminar este edificio porque está siendo utilizado en uno o más contratos.");
                    return;
                }
                
                buildings.splice(index, 1);
                updateLocalStorage();
                updateBuildingList();
                updateBuildingSelect();
            }
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        buildingDiv.appendChild(buildingInfo);
        buildingDiv.appendChild(actionsDiv);
        buildingList.appendChild(buildingDiv);
    });
}

// Manejar clicks fuera del modal para cerrarlo
window.addEventListener('click', function(event) {
    const modal = document.getElementById('building-modal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

updateEntries();
updateBuildingSelect();
updateBuildingList();


