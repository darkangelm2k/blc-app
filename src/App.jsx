import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function App() {
  const [modoIngreso, setModoIngreso] = useState('inicio') 
  
  const [accesoGlobal, setAccesoGlobal] = useState(false)
  const [usuarioGlobal, setUsuarioGlobal] = useState('')
  const [claveGlobal, setClaveGlobal] = useState('')
  const [errorLoginGlobal, setErrorLoginGlobal] = useState(false)

  const [profesorAAutenticar, setProfesorAAutenticar] = useState(null)
  const [pinInput, setPinInput] = useState('')
  const [errorPin, setErrorPin] = useState(false)

  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null)
  const [claseSeleccionada, setClaseSeleccionada] = useState(null)
  
  const [loginAlumnoTipoDoc, setLoginAlumnoTipoDoc] = useState('DNI')
  const [loginAlumnoNumDoc, setLoginAlumnoNumDoc] = useState('')
  const [errorLoginAlumno, setErrorLoginAlumno] = useState(false)
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null)

  const [mostrarError, setMostrarError] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [mostrarModalExportar, setMostrarModalExportar] = useState(false)
  const [mesExportar, setMesExportar] = useState('todo')
  const [mostrarPlanilla, setMostrarPlanilla] = useState(false)
  const [mesPlanilla, setMesPlanilla] = useState('2026-08')

  const [asistencia, setAsistencia] = useState({})
  const [notas, setNotas] = useState({}) 
  const [obsIndividual, setObsIndividual] = useState({})
  const [fechaClase, setFechaClase] = useState('')
  const [horasClase, setHorasClase] = useState('')
  const [obsGeneral, setObsGeneral] = useState('')

  const [profesores, setProfesores] = useState([])
  const [alumnosFirebase, setAlumnosFirebase] = useState([]) 
  const [clasesFirebase, setClasesFirebase] = useState([]) 
  const [registrosFirebase, setRegistrosFirebase] = useState([]) 
  const [pagosFirebase, setPagosFirebase] = useState([]) 
  const [movimientosExtra, setMovimientosExtra] = useState([]) 
  
  const [vistaAdmin, setVistaAdmin] = useState(false)
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState(false)
  const [claveAdminInput, setClaveAdminInput] = useState('')
  const [errorAdminPin, setErrorAdminPin] = useState(false)

  const [adminTab, setAdminTab] = useState('reportes')

  const [nombreNuevoProfesor, setNombreNuevoProfesor] = useState('')
  const [nuevoAlumnoNombre, setNuevoAlumnoNombre] = useState('')
  const [nuevoAlumnoTipoDoc, setNuevoAlumnoTipoDoc] = useState('DNI')
  const [nuevoAlumnoNumDoc, setNuevoAlumnoNumDoc] = useState('')

  const [nuevaClaseTitulo, setNuevaClaseTitulo] = useState('')
  const [nuevaClaseCurso, setNuevaClaseCurso] = useState('')
  const [nuevaClaseTarifa, setNuevaClaseTarifa] = useState('')
  const [nuevaClaseDias, setNuevaClaseDias] = useState('')
  const [nuevaClaseHorario, setNuevaClaseHorario] = useState('')
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]) 
  const [nuevaClaseProfesorId, setNuevaClaseProfesorId] = useState('')

  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [mesFiltroBusqueda, setMesFiltroBusqueda] = useState('todo')
  const [tipoBusqueda, setTipoBusqueda] = useState('alumno') 

  const [editandoCurso, setEditandoCurso] = useState(false)
  const [nuevoNombreCurso, setNuevoNombreCurso] = useState('')
  const [verArchivadasAdmin, setVerArchivadasAdmin] = useState(false)

  const [nuevoPagoAlumno, setNuevoPagoAlumno] = useState('')
  const [nuevoPagoMonto, setNuevoPagoMonto] = useState('')
  const [nuevoPagoMes, setNuevoPagoMes] = useState('2026-08')
  const [mesFinanzas, setMesFinanzas] = useState('2026-08')

  const [tipoMovimiento, setTipoMovimiento] = useState('ingreso_extra')
  const [conceptoMovimiento, setConceptoMovimiento] = useState('')
  const [montoMovimiento, setMontoMovimiento] = useState('')
  const [mesMovimiento, setMesMovimiento] = useState('2026-08')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const profesSnap = await getDocs(collection(db, "profesores"));
        setProfesores(profesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const alumnosSnap = await getDocs(collection(db, "alumnos"));
        setAlumnosFirebase(alumnosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => a.nombre.localeCompare(b.nombre)));

        const clasesSnap = await getDocs(collection(db, "clases"));
        setClasesFirebase(clasesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const regSnap = await getDocs(collection(db, "registrosClases"));
        setRegistrosFirebase(regSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const pagosSnap = await getDocs(collection(db, "pagos"));
        setPagosFirebase(pagosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const movSnap = await getDocs(collection(db, "movimientosExtra"));
        setMovimientosExtra(movSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    cargarDatos();
  }, [mensajeExito]); 

  const todosLosAlumnos = Array.from(new Set([
    ...alumnosFirebase.map(a => a.nombre),
    ...clasesFirebase.flatMap(c => c.estudiantes || [])
  ])).sort();

  const getPromedio = (notasDato) => {
    if (!notasDato) return '--';
    if (typeof notasDato === 'string' || typeof notasDato === 'number') return parseFloat(notasDato).toFixed(1);
    const vals = Object.values(notasDato).map(Number).filter(n => !isNaN(n) && n > 0);
    return vals.length > 0 ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '--';
  }

  const formatNotasStr = (n) => {
    if (!n) return '--';
    if (typeof n === 'string' || typeof n === 'number') return n;
    const prom = getPromedio(n);
    return `${prom} (O:${n.oral||'-'} G:${n.grammar||'-'} R:${n.reading||'-'} L:${n.listening||'-'} W:${n.writing||'-'})`;
  }

  const agregarEncabezadoPDF = async (doc, titulo, subtitulos) => {
    let currentY = 15;
    try {
      const img = new Image(); img.src = '/boss_accredible.png';
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height); const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = 45; const imgHeight = (img.height / img.width) * imgWidth; 
      doc.addImage(imgData, 'JPEG', 14, 10, imgWidth, imgHeight); currentY = 10 + imgHeight + 15; 
    } catch (e) { currentY = 25; }
    doc.setFontSize(24); doc.setTextColor(37, 99, 235); doc.text(titulo, 14, currentY);
    currentY += 10; doc.setFontSize(11); doc.setTextColor(55, 65, 81);
    subtitulos.forEach((texto) => { doc.text(texto, 14, currentY); currentY += 6; });
    return currentY + 8; 
  };

  const generarPDFRecibo = async (pago) => {
    const doc = new jsPDF();
    const startY = await agregarEncabezadoPDF(doc, "Comprobante de Pago", [
      `Centro: Boss Language Center SAC`,
      `RUC: 20603806795`,
      `Fecha de Emisión: ${new Date().toLocaleDateString()}`
    ]);
    doc.setFontSize(14); doc.setTextColor(17, 24, 39); doc.text("Detalles de la Operación:", 14, startY + 10);
    doc.setFontSize(12); doc.setTextColor(75, 85, 99);
    doc.text(`Alumno: ${pago.alumno.toUpperCase()}`, 14, startY + 20);
    doc.text(`Mes Cancelado: ${pago.mes}`, 14, startY + 28);
    doc.text(`Fecha de Registro en Sistema: ${new Date(pago.fechaRegistro).toLocaleDateString()}`, 14, startY + 36);
    doc.setFontSize(18); doc.setTextColor(5, 150, 105); doc.text(`Total Pagado: S/. ${Number(pago.monto).toFixed(2)}`, 14, startY + 55);
    doc.setFontSize(10); doc.setTextColor(156, 163, 175); doc.text("Documento interno y oficial de Boss Language Center SAC.", 14, startY + 75);
    doc.save(`Recibo_BLC_${pago.alumno}_${pago.mes}.pdf`);
  }

  const generarPDFReporteAlumnoUnico = async () => {
    const doc = new jsPDF();
    const registrosAlumno = registrosFirebase.filter(reg => reg.asistencia && reg.asistencia[alumnoSeleccionado]).sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    
    let totalAsistencias = 0; let totalFaltas = 0; let notasList = [];
    registrosAlumno.forEach(reg => {
       const estado = reg.asistencia[alumnoSeleccionado];
       if(estado === 'asistio' || estado === 'reprogramo') {
           totalAsistencias++;
           const nota = reg.notas && reg.notas[alumnoSeleccionado];
           const val = typeof nota === 'object' ? getPromedio(nota) : parseFloat(nota);
           if(!isNaN(val)) notasList.push(parseFloat(val));
       } else if (estado === 'no-asistio') { totalFaltas++; }
    });
    const promedioGlobal = notasList.length > 0 ? (notasList.reduce((a,b)=>a+b,0)/notasList.length).toFixed(1) : '--';
    const asistenciaPorcentaje = totalAsistencias + totalFaltas > 0 ? Math.round((totalAsistencias / (totalAsistencias + totalFaltas))*100) : 0;

    const startY = await agregarEncabezadoPDF(doc, "Libreta de Notas Oficial", [
      `Alumno: ${alumnoSeleccionado.toUpperCase()}`, 
      `Promedio Global: ${promedioGlobal}`, 
      `Asistencia Total: ${asistenciaPorcentaje}%`,
      `Generado: ${new Date().toLocaleDateString()}`
    ]);

    const tableData = [];
    registrosAlumno.forEach(reg => {
        const estado = reg.asistencia[alumnoSeleccionado];
        const observacion = reg.observacionesIndividuales?.[alumnoSeleccionado] || reg.observacionGeneral || '--';
        const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alumnoSeleccionado]) : '--';
        tableData.push([reg.fecha || '--', reg.clase || '--', (estado || '--').replace('-', ' '), notaCol, observacion]);
    });

    autoTable(doc, { startY: startY, head: [['Fecha', 'Clase', 'Asist.', 'Promedio y Detalles', 'Observaciones']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8, cellPadding: 3 }});
    doc.save(`Libreta_${alumnoSeleccionado.replace(' ', '_')}.pdf`);
  }

  const generarPDFPlanilla = async () => {
    const doc = new jsPDF();
    const nombreMes = mesPlanilla === "2026-08" ? "Agosto 2026" : "Julio 2026";
    const startY = await agregarEncabezadoPDF(doc, "Resumen de Pago Docente", [`Profesor: ${profesorSeleccionado.nombre}`, `Periodo: ${nombreMes}`, `Centro: Boss Language Center SAC`]);
    const registrosMes = registrosFirebase.filter(reg => reg.profesor === profesorSeleccionado.nombre && (mesPlanilla === "" || reg.fecha?.startsWith(mesPlanilla)));
    let totalPagar = 0;
    const tableData = registrosMes.map(reg => {
      const monto = (reg.horas || 0) * (reg.tarifa || 0); totalPagar += monto;
      return [reg.fecha || '--', reg.clase || '--', `${reg.horas || 0} hrs`, `S/. ${reg.tarifa || 0}`, `S/. ${monto.toFixed(2)}`];
    });
    autoTable(doc, { startY: startY, head: [['Fecha', 'Clase', 'Horas Impartidas', 'Tarifa/Hora', 'Subtotal']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 9, cellPadding: 3 }});
    doc.setFontSize(16); doc.setTextColor(5, 150, 105); doc.text(`Total a Facturar: S/. ${totalPagar.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 15);
    doc.setFontSize(10); doc.setTextColor(75, 85, 99); doc.text("Instrucciones: Emitir el Recibo por Honorarios a Boss Language Center SAC (RUC: 20603806795).", 14, doc.lastAutoTable.finalY + 25);
    doc.save(`Planilla_${profesorSeleccionado.nombre}_${nombreMes.replace(' ', '_')}.pdf`);
    setMostrarPlanilla(false); setMensajeExito('¡Planilla generada exitosamente! 💰✅'); setTimeout(() => setMensajeExito(''), 4000);
  }

  const generarPDFReporteClase = async () => {
    const doc = new jsPDF();
    let periodoStr = mesExportar === 'todo' ? 'Historial Completo' : mesExportar;
    const startY = await agregarEncabezadoPDF(doc, "Reporte Académico de Grupo", [`Clase: ${claseSeleccionada.titulo}`, `Nivel Actual: ${claseSeleccionada.curso}`, `Profesor a cargo: ${profesorSeleccionado.nombre}`, `Periodo: ${periodoStr}`]);
    let mesPrefix = ""; if (mesExportar === "Agosto 2026") mesPrefix = "2026-08"; else if (mesExportar === "Julio 2026") mesPrefix = "2026-07"; else if (mesExportar === "Junio 2026") mesPrefix = "2026-06";
    const registrosFiltrados = registrosFirebase.filter(reg => reg.clase === claseSeleccionada.titulo && (mesPrefix === "" || reg.fecha?.startsWith(mesPrefix))).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const tableData = [];
    registrosFiltrados.forEach(reg => {
      const estudiantes = Object.keys(reg.asistencia || {});
      estudiantes.forEach(est => {
        const estado = reg.asistencia[est];
        const observacion = reg.observacionesIndividuales?.[est] || reg.observacionGeneral || '--';
        const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[est]) : '--';
        tableData.push([reg.fecha || '--', est, (estado || '--').replace('-', ' '), notaCol, observacion]);
      });
    });
    autoTable(doc, { startY: startY, head: [['Fecha', 'Alumno', 'Asist.', 'Promedio y Detalles', 'Observaciones']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8, cellPadding: 3 }});
    doc.save(`Reporte_${claseSeleccionada.titulo}.pdf`);
    setMostrarModalExportar(false); setMensajeExito('¡Reporte exportado con éxito! 📄✅'); setTimeout(() => setMensajeExito(''), 4000);
  }

  const generarPDFAdmin = async (resultados) => {
    if(resultados.length === 0) return;
    const doc = new jsPDF();
    let periodoStr = mesFiltroBusqueda === 'todo' ? 'Historial Completo' : mesFiltroBusqueda;
    let tituloPDF = ""; let subtitulos = [];

    if (tipoBusqueda === 'alumno') {
      tituloPDF = "Expediente Académico del Alumno"; let nombreMayus = terminoBusqueda ? terminoBusqueda.toUpperCase() : 'General';
      subtitulos = [`Alumno: ${nombreMayus}`, `Generado por: Coordinación Académica`, `Periodo: ${periodoStr}`];
    } else if (tipoBusqueda === 'profesor') {
      tituloPDF = "Expediente del Profesor"; let profMayus = terminoBusqueda ? terminoBusqueda.toUpperCase() : 'General';
      subtitulos = [`Profesor: ${profMayus}`, `Generado por: Coordinación Académica`, `Periodo: ${periodoStr}`];
    } else {
      tituloPDF = "Reporte Académico de Grupo";
      const claseRef = resultados[0].clase || '--'; const profesorRef = resultados[0].profesor || '--';
      const claseEnBD = clasesFirebase.find(c => c.titulo === claseRef); const nivelReal = resultados[0].nivel || (claseEnBD ? claseEnBD.curso : '--');
      subtitulos = [`Clase: ${claseRef}`, `Nivel Actual: ${nivelReal}`, `Profesor a cargo: ${profesorRef}`, `Periodo: ${periodoStr}`];
    }
    const startY = await agregarEncabezadoPDF(doc, tituloPDF, subtitulos);
    const tableData = [];
    resultados.forEach(reg => {
      const nombres = Object.keys(reg.asistencia || {});
      let alumnosAMostrar = nombres;
      if (tipoBusqueda === 'alumno' && terminoBusqueda.trim() !== '') {
         const match = nombres.find(n => n.toLowerCase().includes(terminoBusqueda.toLowerCase()));
         if (match) alumnosAMostrar = [match];
      }
      alumnosAMostrar.forEach(alum => {
         const estado = reg.asistencia?.[alum];
         const observacion = reg.observacionesIndividuales?.[alum] || reg.observacionGeneral || '--';
         const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alum]) : '--';
         tableData.push([reg.fecha || '--', alum || '--', (estado || '--').replace('-', ' '), notaCol, observacion]);
      });
    });
    autoTable(doc, { startY: startY, head: [['Fecha', 'Alumno', 'Asist.', 'Promedio y Detalles', 'Observaciones']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8, cellPadding: 3 } });
    doc.save(`Reporte_Admin_${terminoBusqueda || 'BLC'}.pdf`);
    setMensajeExito('¡Reporte exportado con formato estándar! 📊✅'); setTimeout(() => setMensajeExito(''), 4000);
  }

  const generarExcelAdmin = (resultados) => {
    if(resultados.length === 0) return;
    let csvContent = "Fecha,Alumno,Clase/Nivel,Profesor,Asistencia,Oral,Grammar,Reading,Listening,Writing,Promedio Diario,Observaciones\n";
    resultados.forEach(reg => {
      const nombres = Object.keys(reg.asistencia || {});
      let alumnosAMostrar = nombres;
      if (tipoBusqueda === 'alumno' && terminoBusqueda.trim() !== '') {
         const match = nombres.find(n => n.toLowerCase().includes(terminoBusqueda.toLowerCase()));
         if (match) alumnosAMostrar = [match];
      }
      alumnosAMostrar.forEach(alum => {
         const estado = (reg.asistencia?.[alum] || '--').replace('-', ' ');
         const obs = (reg.observacionesIndividuales?.[alum] || reg.observacionGeneral || '--').replace(/,/g, ' '); 
         const claseEnBD = clasesFirebase.find(c => c.titulo === reg.clase);
         const nivelReal = reg.nivel || (claseEnBD ? claseEnBD.curso : '--');
         
         const n = reg.notas?.[alum];
         let o='--', g='--', r='--', l='--', w='--', prom='--';
         
         if (estado === 'asistio' || estado === 'reprogramo') {
           if (typeof n === 'object' && n !== null) {
              o = n.oral || '--'; g = n.grammar || '--'; r = n.reading || '--'; l = n.listening || '--'; w = n.writing || '--';
              prom = getPromedio(n);
           } else if (n) {
              prom = parseFloat(n).toFixed(1);
           }
         }

         csvContent += `${reg.fecha || '--'},${alum},${reg.clase} (${nivelReal}),${reg.profesor},${estado},${o},${g},${r},${l},${w},${prom},${obs}\n`;
      });
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement("a"); const url = URL.createObjectURL(blob);
    link.setAttribute("href", url); link.setAttribute("download", `Reporte_Admin_${terminoBusqueda || 'BLC'}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setMensajeExito('¡Excel exportado correctamente! 📈✅'); setTimeout(() => setMensajeExito(''), 4000);
  }

  const calcularMetricas = () => {
    const statsAlumnos = {};
    registrosFirebase.forEach(reg => {
      const estudiantes = Object.keys(reg.asistencia || {});
      estudiantes.forEach(est => {
        if(!statsAlumnos[est]) statsAlumnos[est] = { faltas: 0, asistencias: 0, notasSum: 0, notasCount: 0 };
        if(reg.asistencia[est] === 'no-asistio') statsAlumnos[est].faltas++;
        else if(reg.asistencia[est] === 'asistio' || reg.asistencia[est] === 'reprogramo') statsAlumnos[est].asistencias++;
        
        if (reg.asistencia[est] === 'asistio' || reg.asistencia[est] === 'reprogramo') {
          const prom = parseFloat(getPromedio(reg.notas?.[est]));
          if(!isNaN(prom)) { statsAlumnos[est].notasSum += prom; statsAlumnos[est].notasCount++; }
        }
      });
    });
    const arrAlumnos = Object.keys(statsAlumnos).map(nombre => ({
       nombre, faltas: statsAlumnos[nombre].faltas,
       promedio: statsAlumnos[nombre].notasCount > 0 ? (statsAlumnos[nombre].notasSum / statsAlumnos[nombre].notasCount).toFixed(1) : 0
    }));
    const enRiesgo = [...arrAlumnos].filter(a => a.faltas > 0).sort((a,b) => b.faltas - a.faltas).slice(0, 5);
    const cuadroHonor = [...arrAlumnos].filter(a => a.promedio > 0).sort((a,b) => b.promedio - a.promedio).slice(0, 5);
    return { enRiesgo, cuadroHonor };
  }

  const calcularMetricasDocentes = () => {
    const statsProfesores = {};
    profesores.filter(p => p.activo !== false).forEach(prof => {
      statsProfesores[prof.nombre] = { horasTotales: 0, totalAsistencias: 0, totalRegistrosAsistencia: 0, sumaNotas: 0, cantidadNotas: 0, color: prof.color };
    });
    registrosFirebase.forEach(reg => {
      if (mesFiltroBusqueda !== 'todo') {
         const mesRegistro = reg.fecha?.substring(0, 7);
         if (mesRegistro !== mesFiltroBusqueda && mesFiltroBusqueda !== '2026') return;
         if (mesFiltroBusqueda === '2026' && !reg.fecha?.startsWith('2026')) return;
      }
      const profNombre = reg.profesor;
      if (!statsProfesores[profNombre]) return;
      statsProfesores[profNombre].horasTotales += (Number(reg.horas) || 0);
      const estudiantes = Object.keys(reg.asistencia || {});
      estudiantes.forEach(est => {
        const estado = reg.asistencia[est];
        if (estado) {
          statsProfesores[profNombre].totalRegistrosAsistencia++;
          if (estado === 'asistio' || estado === 'reprogramo') { statsProfesores[profNombre].totalAsistencias++; }
        }
        if (estado === 'asistio' || estado === 'reprogramo') {
          const prom = parseFloat(getPromedio(reg.notas?.[est]));
          if (!isNaN(prom)) { statsProfesores[profNombre].sumaNotas += prom; statsProfesores[profNombre].cantidadNotas++; }
        }
      });
    });
    return Object.keys(statsProfesores).map(nombre => {
      const stats = statsProfesores[nombre];
      const engagement = stats.totalRegistrosAsistencia > 0 ? Math.round((stats.totalAsistencias / stats.totalRegistrosAsistencia) * 100) : 0;
      const promedioNotas = stats.cantidadNotas > 0 ? (stats.sumaNotas / stats.cantidadNotas).toFixed(1) : '--';
      return { nombre, horasTotales: stats.horasTotales, engagement, promedioNotas, color: stats.color };
    }).sort((a, b) => b.horasTotales - a.horasTotales); 
  }

  const matchFiltroFinanzas = (fechaDato) => {
    if (!fechaDato) return false;
    if (mesFinanzas === 'todo') return true;
    if (mesFinanzas === '2026') return fechaDato.startsWith('2026');
    return fechaDato.startsWith(mesFinanzas); 
  }

  const calcularFinanzas = () => {
    let ingresosPensiones = 0; let ingresosExtra = 0; let egresosNomina = 0; let egresosExtra = 0;

    pagosFirebase.forEach(pago => {
      if (matchFiltroFinanzas(pago.mes)) ingresosPensiones += Number(pago.monto || 0);
    });
    registrosFirebase.forEach(reg => {
      if (matchFiltroFinanzas(reg.fecha)) egresosNomina += (Number(reg.horas || 0) * Number(reg.tarifa || 0));
    });
    movimientosExtra.forEach(mov => {
      if (matchFiltroFinanzas(mov.mes)) {
        if (mov.tipo === 'ingreso_extra') ingresosExtra += Number(mov.monto || 0);
        else if (mov.tipo === 'gasto_extra') egresosExtra += Number(mov.monto || 0);
      }
    });

    const totalIngresos = ingresosPensiones + ingresosExtra;
    const totalEgresos = egresosNomina + egresosExtra;
    const balance = totalIngresos - totalEgresos;

    const baseReparto = balance > 0 ? balance : 0;
    const reservaEmpresa = baseReparto * 0.20;
    const repartoDaniel = baseReparto * 0.40;
    const repartoMichael = baseReparto * 0.40;

    return { 
      ingresosPensiones, ingresosExtra, totalIngresos, 
      egresosNomina, egresosExtra, totalEgresos, 
      balance, reservaEmpresa, repartoDaniel, repartoMichael 
    };
  }

  const handleToggleActivoAlumno = async (id, estadoActual) => {
    try {
      const alumRef = doc(db, "alumnos", id);
      await updateDoc(alumRef, { activo: !estadoActual });
      setAlumnosFirebase(alumnosFirebase.map(a => a.id === id ? { ...a, activo: !estadoActual } : a));
      setMensajeExito(!estadoActual ? '¡Alumno reactivado! 🔓' : 'Alumno dado de baja 🔒');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleEliminarAlumno = async (id) => {
    if(window.confirm('⚠️ ¿Borrar este alumno del directorio de forma permanente?')) {
      await deleteDoc(doc(db, "alumnos", id));
      setAlumnosFirebase(alumnosFirebase.filter(a => a.id !== id));
      setMensajeExito('Alumno eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  }

  const handleEliminarProfesor = async (id) => {
    if(window.confirm('⚠️ ¿Estás seguro de ELIMINAR PERMANENTEMENTE a este profesor?')) {
      await deleteDoc(doc(db, "profesores", id));
      setProfesores(profesores.filter(p => p.id !== id));
      setMensajeExito('Profesor eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  }

  const handleEliminarClase = async (id) => {
    if(window.confirm('⚠️ ¿Estás seguro de ELIMINAR PERMANENTEMENTE esta clase?')) {
      await deleteDoc(doc(db, "clases", id));
      setClasesFirebase(clasesFirebase.filter(c => c.id !== id));
      setMensajeExito('Clase eliminada 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  }

  const handleEliminarPago = async (id) => {
    if(window.confirm('⚠️ ¿Borrar este registro de pago de forma permanente?')) {
      await deleteDoc(doc(db, "pagos", id));
      setPagosFirebase(pagosFirebase.filter(p => p.id !== id));
      setMensajeExito('Pago eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  }

  const handleEliminarMovimiento = async (id) => {
    if(window.confirm('⚠️ ¿Borrar este movimiento financiero de forma permanente?')) {
      await deleteDoc(doc(db, "movimientosExtra", id));
      setMovimientosExtra(movimientosExtra.filter(m => m.id !== id));
      setMensajeExito('Movimiento eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  }

  const handleAgregarAlumno = async (e) => {
    e.preventDefault();
    if (!nuevoAlumnoNombre || !nuevoAlumnoNumDoc) return;
    try {
      await addDoc(collection(db, "alumnos"), { nombre: nuevoAlumnoNombre, tipoDoc: nuevoAlumnoTipoDoc, numDoc: nuevoAlumnoNumDoc, fechaRegistro: new Date().toISOString(), activo: true });
      setNuevoAlumnoNombre(''); setNuevoAlumnoNumDoc('');
      setMensajeExito('Alumno registrado en el Directorio ✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleToggleActivoProfesor = async (id, estadoActual) => {
    try {
      const profRef = doc(db, "profesores", id); await updateDoc(profRef, { activo: !estadoActual });
      setProfesores(profesores.map(p => p.id === id ? { ...p, activo: !estadoActual } : p));
      setMensajeExito(!estadoActual ? '¡Profesor reactivado! 🔓' : 'Profesor archivado 🔒'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleToggleArchivarClase = async (id, estadoActual) => {
    try {
      const claseRef = doc(db, "clases", id); await updateDoc(claseRef, { archivada: !estadoActual });
      setClasesFirebase(clasesFirebase.map(c => c.id === id ? { ...c, archivada: !estadoActual } : c));
      setMensajeExito(estadoActual ? 'Clase reactivada 📖' : 'Clase archivada 🗂️'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleAgregarProfesor = async (e) => {
    e.preventDefault(); if (nombreNuevoProfesor.trim() === '') return;
    const colores = ['#4285F4', '#EA4335', '#34A853', '#FBBC05', '#8E24AA', '#F538A0', '#00ACC1', '#FF7043'];
    const colorAsignado = colores[Math.floor(Math.random() * colores.length)];
    try {
      await addDoc(collection(db, "profesores"), { nombre: nombreNuevoProfesor, color: colorAsignado, activo: true });
      setNombreNuevoProfesor(''); setMensajeExito('Profesor registrado ✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleAgregarClase = async (e) => {
    e.preventDefault();
    if (!nuevaClaseTitulo || !nuevaClaseCurso || !nuevaClaseTarifa || estudiantesSeleccionados.length === 0 || !nuevaClaseProfesorId || !nuevaClaseDias || !nuevaClaseHorario) {
      setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); return;
    }
    try {
      await addDoc(collection(db, "clases"), {
        titulo: nuevaClaseTitulo, curso: nuevaClaseCurso, tarifa: Number(nuevaClaseTarifa),
        dias: nuevaClaseDias, horario: nuevaClaseHorario, estudiantes: estudiantesSeleccionados, profesorId: nuevaClaseProfesorId, archivada: false
      });
      setNuevaClaseTitulo(''); setNuevaClaseCurso(''); setNuevaClaseTarifa(''); setNuevaClaseDias(''); setNuevaClaseHorario(''); setEstudiantesSeleccionados([]); setNuevaClaseProfesorId('');
      setMensajeExito('Clase creada con éxito ✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleAgregarPago = async (e) => {
    e.preventDefault();
    if (!nuevoPagoAlumno || !nuevoPagoMonto || !nuevoPagoMes) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); return; }
    try {
      await addDoc(collection(db, "pagos"), { alumno: nuevoPagoAlumno, monto: Number(nuevoPagoMonto), mes: nuevoPagoMes, fechaRegistro: new Date().toISOString() });
      setNuevoPagoAlumno(''); setNuevoPagoMonto(''); setMensajeExito('Pago registrado 💰✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleAgregarMovimientoExtra = async (e) => {
    e.preventDefault();
    if (!conceptoMovimiento || !montoMovimiento || !mesMovimiento) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); return; }
    try {
      await addDoc(collection(db, "movimientosExtra"), { tipo: tipoMovimiento, concepto: conceptoMovimiento, monto: Number(montoMovimiento), mes: mesMovimiento, fechaRegistro: new Date().toISOString() });
      setConceptoMovimiento(''); setMontoMovimiento(''); setMensajeExito('Movimiento financiero guardado 📊✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleActualizarCurso = async () => {
    if (nuevoNombreCurso.trim() === '') return;
    try {
      const claseRef = doc(db, "clases", claseSeleccionada.id); await updateDoc(claseRef, { curso: nuevoNombreCurso });
      setClasesFirebase(clasesFirebase.map(c => c.id === claseSeleccionada.id ? { ...c, curso: nuevoNombreCurso } : c));
      setClaseSeleccionada({ ...claseSeleccionada, curso: nuevoNombreCurso });
      setEditandoCurso(false); setMensajeExito('¡Nivel actualizado! 🚀'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const resultadosBusqueda = registrosFirebase.filter(reg => {
    if (terminoBusqueda.trim() === '') return false;
    if (tipoBusqueda === 'alumno') {
      const nombresAlumnos = Object.keys(reg.asistencia || {});
      const alumnoEncontrado = nombresAlumnos.find(nombre => nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()));
      if (!alumnoEncontrado) return false;
    } else if (tipoBusqueda === 'clase') {
      const matchClase = reg.clase && reg.clase.toLowerCase().includes(terminoBusqueda.toLowerCase());
      if (!matchClase) return false;
    } else if (tipoBusqueda === 'profesor') {
      const matchProfesor = reg.profesor && reg.profesor.toLowerCase().includes(terminoBusqueda.toLowerCase());
      if (!matchProfesor) return false;
    }
    if (mesFiltroBusqueda !== 'todo') { 
      if (mesFiltroBusqueda === '2026') return reg.fecha?.substring(0, 4) === '2026';
      return reg.fecha?.substring(0, 7) === mesFiltroBusqueda; 
    }
    return true;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const misClases = profesorSeleccionado ? clasesFirebase.filter(clase => clase.profesorId === profesorSeleccionado.id && !clase.archivada) : [];
  
  useEffect(() => { setAsistencia({}); setNotas({}); setObsIndividual({}); setFechaClase(''); setHorasClase(''); setObsGeneral(''); setEditandoCurso(false); }, [claseSeleccionada])

  const handleLoginGlobal = (e) => {
    e.preventDefault(); if (usuarioGlobal === 'bosslanguagecenter' && claveGlobal === 'cambiandovidas') { setAccesoGlobal(true); setErrorLoginGlobal(false); } else { setErrorLoginGlobal(true); setTimeout(() => setErrorLoginGlobal(false), 3000); }
  }

  const handleLoginProfesor = (e) => {
    e.preventDefault(); const partesNombre = profesorAAutenticar.nombre.split(' '); const iniciales = (partesNombre[0].charAt(0) + (partesNombre[1] ? partesNombre[1].charAt(0) : '')).toUpperCase(); const pinCorrecto = `${iniciales}2026`;
    if (pinInput.toUpperCase() === pinCorrecto) { setProfesorSeleccionado(profesorAAutenticar); setProfesorAAutenticar(null); setPinInput(''); setErrorPin(false); } else { setErrorPin(true); setTimeout(() => setErrorPin(false), 3000); }
  }

  const handleLoginAdmin = (e) => {
    e.preventDefault(); if(claveAdminInput === 'bossadmin2026') { setVistaAdmin(true); setMostrarModalAdmin(false); setClaveAdminInput(''); setErrorAdminPin(false); } else { setErrorAdminPin(true); setTimeout(() => setErrorAdminPin(false), 3000); }
  }

  const handleLoginAlumno = (e) => {
    e.preventDefault();
    const alumnoEncontrado = alumnosFirebase.find(a => a.tipoDoc === loginAlumnoTipoDoc && a.numDoc === loginAlumnoNumDoc);
    if(alumnoEncontrado) {
      if (alumnoEncontrado.activo === false) {
        alert("Tu usuario ha sido dado de baja. Comunícate con administración.");
        return;
      }
      setAlumnoSeleccionado(alumnoEncontrado.nombre);
      setModoIngreso('inicio');
      setLoginAlumnoNumDoc('');
      setErrorLoginAlumno(false);
    } else {
      setErrorLoginAlumno(true);
      setTimeout(() => setErrorLoginAlumno(false), 3000);
    }
  }

  const handleCerrarSesionProfesor = () => { setProfesorSeleccionado(null); setClaseSeleccionada(null); }

  const handleGuardarRegistro = async () => {
    let formularioCompleto = true;
    if (fechaClase.trim() === '' || horasClase.trim() === '') formularioCompleto = false;
    claseSeleccionada.estudiantes.forEach(estudiante => { 
      const ast = asistencia[estudiante];
      if (!ast) formularioCompleto = false;
      if (ast === 'asistio' || ast === 'reprogramo') {
        const n = notas[estudiante];
        if (!n || (!n.oral && !n.grammar && !n.reading && !n.listening && !n.writing)) { formularioCompleto = false; }
      }
    });
    if (formularioCompleto) {
      try {
        await addDoc(collection(db, "registrosClases"), {
          profesor: profesorSeleccionado.nombre, clase: claseSeleccionada.titulo, nivel: claseSeleccionada.curso,
          fecha: fechaClase, horas: Number(horasClase), tarifa: claseSeleccionada.tarifa, asistencia: asistencia, notas: notas, observacionesIndividuales: obsIndividual, observacionGeneral: obsGeneral, fechaRegistro: new Date().toISOString()
        });
        setMensajeExito('¡Registro guardado exitosamente! ☁️✅'); setTimeout(() => setMensajeExito(''), 4000);
        setAsistencia({}); setNotas({}); setObsIndividual({}); setFechaClase(''); setHorasClase(''); setObsGeneral('');
      } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 4000); }
    } else { setMostrarError(true); setTimeout(() => setMostrarError(false), 4000); }
  }

  const obtenerEstiloBoton = (estudiante, estado, colorBorde, colorFondo, colorTexto) => {
    const estadoActual = asistencia[estudiante]; const algunSeleccionado = estadoActual !== undefined; const estaSeleccionado = estadoActual === estado; const mostrarColor = !algunSeleccionado || estaSeleccionado;
    return { padding: '8px 12px', borderRadius: '6px', border: `1px solid ${mostrarColor ? colorBorde : '#e5e7eb'}`, backgroundColor: mostrarColor ? colorFondo : '#f9fafb', color: mostrarColor ? colorTexto : '#9ca3af', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s ease', transform: estaSeleccionado ? 'scale(1.05)' : 'scale(1)', boxShadow: estaSeleccionado ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', opacity: (!estaSeleccionado && algunSeleccionado) ? 0.5 : 1 }
  }

  const estilosGlobales = (
    <style>{`
      body { margin: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #e5e7eb; }
      .login-card { background: white; padding: 40px 40px 30px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 320px; text-align: center; position: relative; }
      .login-input-group { background-color: #f3f4f6; border-radius: 6px; margin-bottom: 16px; display: flex; align-items: center; padding: 0 15px; }
      .login-input { border: none; background: transparent; padding: 14px 0; width: 100%; outline: none; font-size: 14px; color: #4b5563; }
      .login-btn { background-color: #3b82f6; color: white; border: none; width: 100%; padding: 14px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; letter-spacing: 0.5px; }
      .login-btn:hover { background-color: #2563eb; }
      .tarjeta-notificacion { display: flex; align-items: center; gap: 16px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 24px; padding: 16px 20px; width: 320px; cursor: pointer; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); transition: all 0.2s ease; box-sizing: border-box; }
      .tarjeta-notificacion:hover { background: #ffffff; box-shadow: 0 6px 32px rgba(0, 0, 0, 0.1); transform: translateY(-3px); }
      .avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 600; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
      .btn-flotante { transition: all 0.2s ease; }
      .btn-flotante:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      .btn-flotante:active { transform: translateY(1px); }
      .input-flotante { transition: all 0.2s ease; text-align: left; }
      .input-flotante:focus, .input-flotante:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.08); border-color: #3b82f6 !important; }
      @keyframes deslizarAbajo { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }
      @keyframes aparecerFade { from { opacity: 0; transform: scale(0.95) translate(-50%, -50%); } to { opacity: 1; transform: scale(1) translate(-50%, -50%); } }
      @keyframes vibrar { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      
      .admin-menu-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; border-radius: 10px; border: none; cursor: pointer; font-size: 15px; font-weight: 500; text-align: left; transition: all 0.2s ease; }
      .admin-menu-btn:hover { background-color: #f3f4f6; }
      .admin-menu-btn.active { background-color: #eff6ff; color: #2563eb; }
      .admin-menu-btn.inactive { background-color: transparent; color: #4b5563; }
      
      .scroll-casillas::-webkit-scrollbar { width: 6px; }
      .scroll-casillas::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
      .scroll-casillas::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      .scroll-casillas::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

      .big-btn-home { padding: 20px 30px; border-radius: 16px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: all 0.3s ease; border: none; width: 250px; }
      .big-btn-home:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    `}</style>
  )

  if (modoIngreso === 'inicio' && !alumnoSeleccionado && !accesoGlobal) {
    return (
      <div className="login-container" style={{ flexDirection: 'column' }}>
        {estilosGlobales}
        <img src="/boss_accredible.png" alt="Logo" style={{ height: '90px', marginBottom: '40px' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
        <h1 style={{ color: '#1f2937', marginBottom: '40px', fontSize: '28px', textAlign: 'center' }}>Bienvenido a Boss Language Center</h1>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => setModoIngreso('alumno')} className="big-btn-home" style={{ backgroundColor: '#059669', color: 'white', boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)' }}>
            <span style={{ fontSize: '40px' }}>🎓</span>
            Portal Estudiantes
            <span style={{ fontSize: '13px', fontWeight: 'normal', opacity: 0.9 }}>Ver notas y asistencias</span>
          </button>
          
          <button onClick={() => setModoIngreso('staff')} className="big-btn-home" style={{ backgroundColor: '#1f2937', color: 'white', boxShadow: '0 4px 15px rgba(31, 41, 55, 0.3)' }}>
            <span style={{ fontSize: '40px' }}>💼</span>
            Acceso Docentes / Staff
            <span style={{ fontSize: '13px', fontWeight: 'normal', opacity: 0.9 }}>Gestión académica interna</span>
          </button>
        </div>
      </div>
    )
  }

  if (modoIngreso === 'alumno' && !alumnoSeleccionado) {
    return (
      <div className="login-container" style={{ flexDirection: 'column' }}>
        {estilosGlobales}
        <button onClick={() => setModoIngreso('inicio')} style={{ position: 'absolute', top: 30, left: 30, background: 'white', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' }}>← Volver</button>
        
        <div className="login-card" style={{ animation: errorLoginAlumno ? 'vibrar 0.3s ease' : 'none' }}>
          <h2 style={{ color: '#111827', fontSize: '22px', marginBottom: '10px' }}>🎓 Portal del Alumno</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '25px' }}>Ingresa con tu documento de identidad registrado.</p>
          <form onSubmit={handleLoginAlumno}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <select value={loginAlumnoTipoDoc} onChange={(e) => setLoginAlumnoTipoDoc(e.target.value)} className="input-flotante" style={{ width: '35%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontSize: '13px' }}>
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
                <option value="Pasaporte">Pasap.</option>
                <option value="RUC">RUC</option>
                <option value="Otro">Otro</option>
              </select>
              <input type="text" placeholder="N° de Documento" value={loginAlumnoNumDoc} onChange={(e) => setLoginAlumnoNumDoc(e.target.value)} className="input-flotante" style={{ width: '65%', padding: '14px', borderRadius: '8px', border: errorLoginAlumno ? '1px solid #ef4444' : '1px solid #d1d5db', outline: 'none', textAlign: 'center', fontSize: '15px', letterSpacing: '1px' }} autoFocus />
            </div>
            {errorLoginAlumno && <p style={{ color: '#ef4444', fontSize: '12px', margin: '-10px 0 15px 0' }}>Documento no encontrado o dado de baja.</p>}
            <button type="submit" className="login-btn" style={{ backgroundColor: '#059669' }}>Acceder a mis Notas</button>
          </form>
        </div>
      </div>
    )
  }

  if (alumnoSeleccionado) {
    const registrosAlumno = registrosFirebase.filter(reg => reg.asistencia && reg.asistencia[alumnoSeleccionado]);
    const pagosAlumno = pagosFirebase.filter(p => p.alumno === alumnoSeleccionado).sort((a,b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));

    let totalAsistencias = 0; let totalFaltas = 0; let notasList = [];
    registrosAlumno.forEach(reg => {
       const estado = reg.asistencia[alumnoSeleccionado];
       if(estado === 'asistio' || estado === 'reprogramo') {
           totalAsistencias++;
           const nota = reg.notas && reg.notas[alumnoSeleccionado];
           const val = typeof nota === 'object' ? getPromedio(nota) : parseFloat(nota);
           if(!isNaN(val)) notasList.push(parseFloat(val));
       } else if (estado === 'no-asistio') { totalFaltas++; }
    });

    const asistenciaPorcentaje = totalAsistencias + totalFaltas > 0 ? Math.round((totalAsistencias / (totalAsistencias + totalFaltas))*100) : 0;
    const promedioGlobal = notasList.length > 0 ? (notasList.reduce((a,b)=>a+b,0)/notasList.length).toFixed(1) : '--';
    const mesReferencia = new Date().toISOString().substring(0, 7); 
    const pagoAlDia = pagosFirebase.some(p => p.alumno === alumnoSeleccionado && p.mes === mesReferencia);

    return (
      <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {estilosGlobales}
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.4s ease' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src="/boss_accredible.png" alt="Logo" style={{ height: '50px' }} />
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#111827', textTransform: 'capitalize' }}>Hola, {alumnoSeleccionado}</h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Portal Académico y Financiero</p>
              </div>
            </div>
            <button onClick={() => {setAlumnoSeleccionado(null); setModoIngreso('inicio')}} className="btn-flotante" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Sesión</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={generarPDFReporteAlumnoUnico} className="btn-flotante" style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>
              📄 Descargar Libreta de Notas
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Promedio Global</p>
              <h3 style={{ margin: 0, fontSize: '32px', color: '#2563eb' }}>{promedioGlobal}</h3>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `4px solid ${asistenciaPorcentaje >= 75 ? '#10b981' : '#f59e0b'}` }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Asistencia Total</p>
              <h3 style={{ margin: 0, fontSize: '32px', color: asistenciaPorcentaje >= 75 ? '#059669' : '#d97706' }}>{asistenciaPorcentaje}%</h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>{totalFaltas} inasistencias</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `4px solid ${pagoAlDia ? '#10b981' : '#ef4444'}` }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Estado de Cuenta ({mesReferencia})</p>
              <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: pagoAlDia ? '#dcfce7' : '#fee2e2', borderRadius: '20px', marginTop: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: pagoAlDia ? '#166534' : '#9f1239' }}>{pagoAlDia ? '🟢 Al día' : '🔴 Pendiente'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>📚 Mi Historial de Clases</h2>
              <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '400px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                      <th style={{ padding: '12px' }}>Fecha</th>
                      <th style={{ padding: '12px' }}>Asistencia</th>
                      <th style={{ padding: '12px' }}>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosAlumno.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map((reg, idx) => {
                      const estado = reg.asistencia[alumnoSeleccionado];
                      const colorEstado = estado === 'asistio' ? '#10b981' : estado === 'no-asistio' ? '#ef4444' : '#f59e0b';
                      const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alumnoSeleccionado]) : '--';
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{reg.fecha}</td>
                          <td style={{ padding: '12px', color: colorEstado, fontWeight: '600', textTransform: 'capitalize' }}>{estado.replace('-', ' ')}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{notaCol}</td>
                        </tr>
                      )
                    })}
                    {registrosAlumno.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No hay clases registradas.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>💰 Mis Pagos y Boletas</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                {pagosAlumno.map(pago => (
                  <div key={pago.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Mes: {pago.mes}</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(pago.fechaRegistro).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>S/. {pago.monto.toFixed(2)}</span>
                      <button onClick={() => generarPDFRecibo(pago)} className="btn-flotante" style={{ background: '#3b82f6', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: 'white', fontWeight: 'bold' }}>
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
                {pagosAlumno.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>No tienes pagos registrados.</p>}
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

  if (modoIngreso === 'staff' && !accesoGlobal) {
    return (
      <div className="login-container" style={{ flexDirection: 'column' }}>
        {estilosGlobales}
        <button onClick={() => setModoIngreso('inicio')} style={{ position: 'absolute', top: 30, left: 30, background: 'white', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' }}>← Volver</button>
        <div className="login-card" style={{ animation: errorLoginGlobal ? 'vibrar 0.3s ease' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
            <img src="/boss_accredible.png" alt="Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
          </div>
          <h2 style={{ color: '#4b5563', fontSize: '18px', fontWeight: '500', marginBottom: '25px' }}>Staff Log in</h2>
          <form onSubmit={handleLoginGlobal}>
            <div className="login-input-group" style={{ border: errorLoginGlobal ? '1px solid #ef4444' : '1px solid transparent' }}>
              <input type="text" placeholder="User ID" className="login-input" value={usuarioGlobal} onChange={(e) => setUsuarioGlobal(e.target.value)} />
              <span style={{ color: '#9ca3af', fontSize: '18px' }}>👤</span>
            </div>
            <div className="login-input-group" style={{ border: errorLoginGlobal ? '1px solid #ef4444' : '1px solid transparent' }}>
              <input type="password" placeholder="••••••••" className="login-input" value={claveGlobal} onChange={(e) => setClaveGlobal(e.target.value)} />
              <span style={{ color: '#9ca3af', fontSize: '18px' }}>🔑</span>
            </div>
            {errorLoginGlobal && <p style={{ color: '#ef4444', fontSize: '12px', margin: '-10px 0 15px 0', textAlign: 'left' }}>Credenciales incorrectas.</p>}
            <button type="submit" className="login-btn" style={{ backgroundColor: '#1f2937' }}>INGRESAR AL SISTEMA</button>
          </form>
        </div>
      </div>
    )
  }

  // 7. PANTALLA SELECCIÓN DE PROFESOR (AQUI FALTABAN LOS MODALES)
  if (accesoGlobal && !vistaAdmin && !profesorSeleccionado) {
    return (
      <>
        {estilosGlobales}
        
        {mostrarModalAdmin && (
          <>
            <div onClick={() => {setMostrarModalAdmin(false); setErrorAdminPin(false); setClaveAdminInput('')}} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', top: '50%', left: '50%', width: '90%', maxWidth: '350px', backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1000, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '20px' }}>Acceso Administrativo</h2>
              <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>Ingresa la clave maestra.</p>
              <form onSubmit={handleLoginAdmin}>
                <input type="password" placeholder="Clave Maestra" className="input-flotante" value={claveAdminInput} onChange={(e) => setClaveAdminInput(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: errorAdminPin ? '1px solid #ef4444' : '1px solid #d1d5db', outline: 'none', marginBottom: '16px', textAlign: 'center' }} autoFocus />
                <button type="submit" className="btn-flotante" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Entrar al Panel</button>
              </form>
            </div>
          </>
        )}

        {profesorAAutenticar && (
          <>
            <div onClick={() => {setProfesorAAutenticar(null); setErrorPin(false); setPinInput('')}} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', top: '50%', left: '50%', width: '90%', maxWidth: '350px', backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1000, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: profesorAAutenticar.color, color: 'white', fontSize: '24px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>{profesorAAutenticar.nombre.charAt(0)}</div>
              <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '20px' }}>Hola, {profesorAAutenticar.nombre.split(' ')[0]}</h2>
              <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>Ingresa tu PIN de seguridad.</p>
              <form onSubmit={handleLoginProfesor}>
                <input type="password" placeholder="PIN" className="input-flotante" value={pinInput} onChange={(e) => setPinInput(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: errorPin ? '1px solid #ef4444' : '1px solid #d1d5db', outline: 'none', marginBottom: '16px', textAlign: 'center' }} autoFocus />
                <button type="submit" className="btn-flotante" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Ingresar</button>
              </form>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', backgroundColor: '#f4f6f8' }}>
          <div style={{ position: 'absolute', top: '25px', left: '30px' }}>
            <button onClick={() => {setAccesoGlobal(false); setModoIngreso('inicio')}} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>🚪 Salir a Inicio</button>
          </div>
          <div style={{ position: 'absolute', top: '25px', right: '30px', display: 'flex', gap: '10px' }}>
            <button onClick={() => setMostrarModalAdmin(true)} className="btn-flotante" style={{ background: '#111827', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>⚙️ Admin Panel</button>
          </div>
          <div style={{ marginTop: '20px', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/boss_accredible.png" alt="Logo" style={{ width: '120px', height: 'auto', marginBottom: '15px' }} onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
            <h1 style={{ color: '#1f2937', margin: '0 0 8px 0', fontWeight: '600', fontSize: '30px' }}>Boss Language Center</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Selecciona tu perfil docente para iniciar clase</p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', maxWidth: '750px', margin: '0 auto', paddingBottom: '40px' }}>
            {profesores.filter(p => p.activo !== false).map((profesor) => (
              <div key={profesor.id} onClick={() => setProfesorAAutenticar(profesor)} className="tarjeta-notificacion" style={{ backgroundColor: 'white' }}>
                <div className="avatar" style={{ backgroundColor: profesor.color }}>{profesor.nombre.charAt(0)}</div>
                <div className="textos" style={{ textAlign: 'left' }}>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1f1f1f', fontWeight: '600' }}>{profesor.nombre}</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#5f6368' }}>Language Teacher</p>
                </div>
              </div>
            ))}
            {profesores.filter(p => p.activo !== false).length === 0 && (
              <div style={{ padding: '20px', color: '#6b7280', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #d1d5db', width: '100%', maxWidth: '320px' }}>
                <p style={{ margin: 0 }}>No hay profesores registrados.</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>Usa el <strong>Panel Admin</strong> arriba a la derecha para agregar uno.</p>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // FALLBACK SEGURO
  return null;
}

export default App