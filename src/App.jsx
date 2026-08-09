import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function App() {
  const [accesoGlobal, setAccesoGlobal] = useState(false)
  const [usuarioGlobal, setUsuarioGlobal] = useState('')
  const [claveGlobal, setClaveGlobal] = useState('')
  const [errorLoginGlobal, setErrorLoginGlobal] = useState(false)

  const [profesorAAutenticar, setProfesorAAutenticar] = useState(null)
  const [pinInput, setPinInput] = useState('')
  const [errorPin, setErrorPin] = useState(false)

  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null)
  const [claseSeleccionada, setClaseSeleccionada] = useState(null)
  
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
  const [nuevaClaseTitulo, setNuevaClaseTitulo] = useState('')
  const [nuevaClaseCurso, setNuevaClaseCurso] = useState('')
  const [nuevaClaseTarifa, setNuevaClaseTarifa] = useState('')
  const [nuevaClaseDias, setNuevaClaseDias] = useState('')
  const [nuevaClaseHorario, setNuevaClaseHorario] = useState('')
  const [nuevaClaseEstudiantes, setNuevaClaseEstudiantes] = useState('')
  const [nuevaClaseProfesorId, setNuevaClaseProfesorId] = useState('')

  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [mesFiltroBusqueda, setMesFiltroBusqueda] = useState('todo')
  const [tipoBusqueda, setTipoBusqueda] = useState('alumno') 

  const [editandoCurso, setEditandoCurso] = useState(false)
  const [nuevoNombreCurso, setNuevoNombreCurso] = useState('')
  const [verArchivadasAdmin, setVerArchivadasAdmin] = useState(false)

  // ESTADOS FINANCIEROS
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
    if(accesoGlobal) cargarDatos();
  }, [accesoGlobal, mensajeExito]); 

  const todosLosAlumnos = Array.from(new Set(clasesFirebase.flatMap(c => c.estudiantes || []))).sort();

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

  // NUEVO: GENERADOR DE BOLETAS DE PAGO
  const generarPDFRecibo = async (pago) => {
    const doc = new jsPDF();
    const startY = await agregarEncabezadoPDF(doc, "Comprobante de Pago", [
      `Centro: Boss Language Center SAC`,
      `RUC: 20603806795`,
      `Fecha de Emisión: ${new Date().toLocaleDateString()}`
    ]);
    
    doc.setFontSize(14); doc.setTextColor(17, 24, 39);
    doc.text("Detalles de la Operación:", 14, startY + 10);
    
    doc.setFontSize(12); doc.setTextColor(75, 85, 99);
    doc.text(`Alumno: ${pago.alumno.toUpperCase()}`, 14, startY + 20);
    doc.text(`Mes Cancelado: ${pago.mes}`, 14, startY + 28);
    doc.text(`Fecha de Registro en Sistema: ${new Date(pago.fechaRegistro).toLocaleDateString()}`, 14, startY + 36);

    doc.setFontSize(18); doc.setTextColor(5, 150, 105); 
    doc.text(`Total Pagado: S/. ${Number(pago.monto).toFixed(2)}`, 14, startY + 55);

    doc.setFontSize(10); doc.setTextColor(156, 163, 175);
    doc.text("Documento interno y oficial de Boss Language Center SAC.", 14, startY + 75);

    doc.save(`Recibo_BLC_${pago.alumno}_${pago.mes}.pdf`);
    setMensajeExito('¡Comprobante generado! 📄✅'); setTimeout(() => setMensajeExito(''), 3000);
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
         if (mesRegistro !== mesFiltroBusqueda) return;
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

  // NUEVA FUNCION DE MATCH PARA SOPORTAR "TODO EL 2026"
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
    const repartoNano = baseReparto * 0.40;
    const repartoAlonso = baseReparto * 0.40;

    return { 
      ingresosPensiones, ingresosExtra, totalIngresos, 
      egresosNomina, egresosExtra, totalEgresos, 
      balance, reservaEmpresa, repartoNano, repartoAlonso 
    };
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
    if (!nuevaClaseTitulo || !nuevaClaseCurso || !nuevaClaseTarifa || !nuevaClaseEstudiantes || !nuevaClaseProfesorId || !nuevaClaseDias || !nuevaClaseHorario) {
      setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); return;
    }
    const listaEstudiantes = nuevaClaseEstudiantes.split(',').map(est => est.trim()).filter(est => est !== '');
    try {
      await addDoc(collection(db, "clases"), {
        titulo: nuevaClaseTitulo, curso: nuevaClaseCurso, tarifa: Number(nuevaClaseTarifa),
        dias: nuevaClaseDias, horario: nuevaClaseHorario, estudiantes: listaEstudiantes, profesorId: nuevaClaseProfesorId, archivada: false
      });
      setNuevaClaseTitulo(''); setNuevaClaseCurso(''); setNuevaClaseTarifa(''); setNuevaClaseDias(''); setNuevaClaseHorario(''); setNuevaClaseEstudiantes(''); setNuevaClaseProfesorId('');
      setMensajeExito('Clase creada ✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleAgregarPago = async (e) => {
    e.preventDefault();
    if (!nuevoPagoAlumno || !nuevoPagoMonto || !nuevoPagoMes) {
      setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); return;
    }
    try {
      await addDoc(collection(db, "pagos"), {
        alumno: nuevoPagoAlumno,
        monto: Number(nuevoPagoMonto),
        mes: nuevoPagoMes,
        fechaRegistro: new Date().toISOString()
      });
      setNuevoPagoAlumno(''); setNuevoPagoMonto('');
      setMensajeExito('Pago registrado en el sistema 💰✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); }
  }

  const handleAgregarMovimientoExtra = async (e) => {
    e.preventDefault();
    if (!conceptoMovimiento || !montoMovimiento || !mesMovimiento) {
      setMostrarError(true); setTimeout(() => setMostrarError(false), 3000); return;
    }
    try {
      await addDoc(collection(db, "movimientosExtra"), {
        tipo: tipoMovimiento,
        concepto: conceptoMovimiento,
        monto: Number(montoMovimiento),
        mes: mesMovimiento,
        fechaRegistro: new Date().toISOString()
      });
      setConceptoMovimiento(''); setMontoMovimiento('');
      setMensajeExito('Movimiento financiero guardado 📊✅'); setTimeout(() => setMensajeExito(''), 3000);
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
    if (mesFiltroBusqueda !== 'todo') { const mesRegistro = reg.fecha?.substring(0, 7); if (mesRegistro !== mesFiltroBusqueda) return false; }
    return true;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const misClases = profesorSeleccionado ? clasesFirebase.filter(clase => clase.profesorId === profesorSeleccionado.id && !clase.archivada) : [];
  const profesoresActivos = profesores.filter(profesor => profesor.activo !== false)

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

  const handleCerrarSesionProfesor = () => { setProfesorSeleccionado(null); setClaseSeleccionada(null); }

  const handleGuardarRegistro = async () => {
    let formularioCompleto = true;
    if (fechaClase.trim() === '' || horasClase.trim() === '') formularioCompleto = false;
    
    claseSeleccionada.estudiantes.forEach(estudiante => { 
      const ast = asistencia[estudiante];
      if (!ast) formularioCompleto = false;
      if (ast === 'asistio' || ast === 'reprogramo') {
        const n = notas[estudiante];
        if (!n || (!n.oral && !n.grammar && !n.reading && !n.listening && !n.writing)) {
          formularioCompleto = false;
        }
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
    return {
      padding: '8px 12px', borderRadius: '6px', border: `1px solid ${mostrarColor ? colorBorde : '#e5e7eb'}`, backgroundColor: mostrarColor ? colorFondo : '#f9fafb', color: mostrarColor ? colorTexto : '#9ca3af', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s ease', transform: estaSeleccionado ? 'scale(1.05)' : 'scale(1)', boxShadow: estaSeleccionado ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', opacity: (!estaSeleccionado && algunSeleccionado) ? 0.5 : 1
    }
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
    `}</style>
  )

  if (!accesoGlobal) {
    return (
      <>
        {estilosGlobales}
        <div className="login-container">
          <div className="login-card" style={{ animation: errorLoginGlobal ? 'vibrar 0.3s ease' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <img src="/boss_accredible.png" alt="Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
            </div>
            <h2 style={{ color: '#4b5563', fontSize: '18px', fontWeight: '500', marginBottom: '25px' }}>User Log in</h2>
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
              <button type="submit" className="login-btn">LOGIN</button>
            </form>
          </div>
        </div>
      </>
    )
  }

  if (vistaAdmin) {
    const { enRiesgo, cuadroHonor } = calcularMetricas();
    const finanzas = calcularFinanzas();

    return (
      <>
        {estilosGlobales}
        {mostrarError && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>⚠️</span><div><h4 style={{ margin: 0 }}>Faltan datos por llenar</h4></div></div>)}
        {mensajeExito && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>☁️</span><div><h4 style={{ margin: 0 }}>{mensajeExito}</h4></div></div>)}

        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f8' }}>
          
          <div style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
              <img src="/boss_accredible.png" alt="Logo" style={{ height: '40px', marginBottom: '10px' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
              <h1 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Admin Panel</h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Centro de Operaciones</p>
            </div>
            
            <div style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
              <button className={`admin-menu-btn ${adminTab === 'reportes' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('reportes')}>
                <span style={{ fontSize: '20px' }}>📈</span> Reportes Alumnos
              </button>
              <button className={`admin-menu-btn ${adminTab === 'rendimiento' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('rendimiento')}>
                <span style={{ fontSize: '20px' }}>👨‍🏫</span> Rendimiento Docente
              </button>
              <button className={`admin-menu-btn ${adminTab === 'finanzas' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('finanzas')}>
                <span style={{ fontSize: '20px' }}>💰</span> Finanzas y Pagos
              </button>
              <button className={`admin-menu-btn ${adminTab === 'clases' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('clases')}>
                <span style={{ fontSize: '20px' }}>📚</span> Gestión de Clases
              </button>
              <button className={`admin-menu-btn ${adminTab === 'profesores' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('profesores')}>
                <span style={{ fontSize: '20px' }}>👤</span> Directorio Profesores
              </button>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setVistaAdmin(false)} className="btn-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#4b5563', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                🚪 Salir del Admin
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

              {adminTab === 'reportes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>🔍 Buscador y Exportación</h2>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{ display: 'flex', gap: '10px', flex: '1 1 auto', flexWrap: 'wrap' }}>
                        <select value={tipoBusqueda} onChange={(e) => {setTipoBusqueda(e.target.value); setTerminoBusqueda('');}} className="input-flotante" style={{ width: '160px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>
                          <option value="alumno">👤 Alumno</option>
                          <option value="clase">📚 Grupo / Empresa</option>
                          <option value="profesor">👨‍🏫 Profesor</option>
                        </select>
                        <input type="text" placeholder={tipoBusqueda === 'alumno' ? "Buscar alumno..." : tipoBusqueda === 'clase' ? "Buscar grupo..." : "Buscar profesor..."} value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} className="input-flotante" style={{ flex: 1, minWidth: '200px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
                        <select value={mesFiltroBusqueda} onChange={(e) => setMesFiltroBusqueda(e.target.value)} className="input-flotante" style={{ width: '160px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}>
                          <option value="todo">Historial Completo</option>
                          <option value="2026">Todo el 2026 (Anual)</option>
                          <option value="2026-08">Agosto 2026</option>
                          <option value="2026-07">Julio 2026</option>
                          <option value="2026-06">Junio 2026</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => generarPDFAdmin(resultadosBusqueda)} className="btn-flotante" style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>📄 PDF</button>
                        <button onClick={() => generarExcelAdmin(resultadosBusqueda)} className="btn-flotante" style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>📊 EXCEL</button>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      {terminoBusqueda.trim() === '' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '10px' }}>
                          <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#be123c', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🚨 Alerta de Riesgo (Faltas)</h3>
                            {enRiesgo.length === 0 ? <p style={{ fontSize: '13px', color: '#9f1239' }}>No hay alumnos con faltas.</p> : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {enRiesgo.map((al, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#881337', textTransform: 'capitalize' }}>{al.nombre}</span>
                                    <span style={{ fontSize: '12px', backgroundColor: '#f43f5e', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{al.faltas} faltas</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#15803d', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🏆 Cuadro de Honor</h3>
                            {cuadroHonor.length === 0 ? <p style={{ fontSize: '13px', color: '#166534' }}>Aún no hay notas registradas.</p> : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {cuadroHonor.map((al, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#14532d', textTransform: 'capitalize' }}>{al.nombre}</span>
                                    <span style={{ fontSize: '12px', backgroundColor: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Nota: {al.promedio}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : resultadosBusqueda.length === 0 ? (
                        <p style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>No se encontraron registros para "{terminoBusqueda}".</p>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '700px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f3f4f6', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                              <th style={{ padding: '12px' }}>Fecha</th><th style={{ padding: '12px' }}>Alumno</th><th style={{ padding: '12px' }}>Clase / Nivel</th><th style={{ padding: '12px' }}>Profesor</th><th style={{ padding: '12px' }}>Asistencia</th><th style={{ padding: '12px' }}>Nota</th><th style={{ padding: '12px' }}>Observaciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultadosBusqueda.map((reg, idx) => {
                                const nombres = Object.keys(reg.asistencia || {});
                                let alumnosAMostrar = nombres;
                                if (tipoBusqueda === 'alumno') { const match = nombres.find(n => n.toLowerCase().includes(terminoBusqueda.toLowerCase())); if (match) alumnosAMostrar = [match]; }
                                const claseEnBD = clasesFirebase.find(c => c.titulo === reg.clase); const nivelReal = reg.nivel || (claseEnBD ? claseEnBD.curso : '--');
                                return alumnosAMostrar.map((alum, subIdx) => {
                                  const estado = reg.asistencia?.[alum]; const colorEstado = estado === 'asistio' ? '#10b981' : estado === 'no-asistio' ? '#ef4444' : '#f59e0b';
                                  const observacion = reg.observacionesIndividuales?.[alum] || reg.observacionGeneral || '--';
                                  const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alum]) : '--';
                                  return (
                                    <tr key={`${reg.id || idx}-${subIdx}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>{reg.fecha}</td><td style={{ padding: '12px', textTransform: 'capitalize' }}>{alum}</td>
                                        <td style={{ padding: '12px' }}>{reg.clase} <br/><span style={{ color: '#6b7280', fontSize: '11px' }}>Nivel: {nivelReal}</span></td><td style={{ padding: '12px' }}>{reg.profesor}</td>
                                        <td style={{ padding: '12px', color: colorEstado, fontWeight: '600', textTransform: 'capitalize' }}>{estado?.replace('-', ' ')}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>{notaCol}</td>
                                        <td style={{ padding: '12px', color: '#4b5563', maxWidth: '200px' }}>{observacion}</td>
                                    </tr>
                                  )
                                });
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'rendimiento' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Dashboard Académico Docente</h2>
                      <select value={mesFiltroBusqueda} onChange={(e) => setMesFiltroBusqueda(e.target.value)} className="input-flotante" style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontSize: '13px' }}>
                        <option value="todo">Historial Completo</option>
                        <option value="2026">Todo el 2026 (Anual)</option>
                        <option value="2026-08">Agosto 2026</option>
                        <option value="2026-07">Julio 2026</option>
                        <option value="2026-06">Junio 2026</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {calcularMetricasDocentes().map((metrica, idx) => (
                        <div key={idx} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar" style={{ backgroundColor: metrica.color, width: '36px', height: '36px', fontSize: '14px' }}>{metrica.nombre.charAt(0)}</div>
                            <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{metrica.nombre}</span>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>{metrica.horasTotales}<span style={{ fontSize:'12px', color:'#6b7280', fontWeight:'normal'}}>h</span></div>
                              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginTop: '2px' }}>⏱️ Carga Horaria</div>
                            </div>
                            <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: metrica.engagement >= 80 ? '#10b981' : (metrica.engagement >= 60 ? '#f59e0b' : '#ef4444') }}>{metrica.engagement}%</div>
                              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginTop: '2px' }}>🧲 Asistencia</div>
                            </div>
                            <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center', gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: '18px', fontWeight: '700', color: '#8b5cf6' }}>{metrica.promedioNotas}</div>
                              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginTop: '2px' }}>⚖️ Promedio Notas Otorgadas</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {calcularMetricasDocentes().length === 0 && (
                        <p style={{ color: '#9ca3af', fontSize: '13px', gridColumn: '1 / -1', textAlign: 'center' }}>No hay datos de docentes en el periodo seleccionado.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'finanzas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Dashboard Financiero e Ingresos</h2>
                    <select value={mesFinanzas} onChange={(e) => setMesFinanzas(e.target.value)} className="input-flotante" style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontSize: '13px', fontWeight: 'bold' }}>
                      <option value="todo">Historial Completo</option>
                      <option value="2026">Todo el 2026 (Anual)</option>
                      <option value="2026-08">Agosto 2026</option>
                      <option value="2026-07">Julio 2026</option>
                      <option value="2026-06">Junio 2026</option>
                    </select>
                  </div>

                  {/* Tarjetas Principales */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '6px solid #10b981' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Ingresos Totales</p>
                      <h3 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>S/. {finanzas.totalIngresos.toFixed(2)}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>Pens.: S/. {finanzas.ingresosPensiones} | Extra: S/. {finanzas.ingresosExtra}</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '6px solid #ef4444' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Egresos Totales</p>
                      <h3 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>S/. {finanzas.totalEgresos.toFixed(2)}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>Nóm.: S/. {finanzas.egresosNomina} | Extra: S/. {finanzas.egresosExtra}</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `6px solid ${finanzas.balance >= 0 ? '#3b82f6' : '#f97316'}` }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Balance Neto</p>
                      <h3 style={{ margin: 0, fontSize: '24px', color: finanzas.balance >= 0 ? '#1d4ed8' : '#c2410c' }}>S/. {finanzas.balance.toFixed(2)}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>Resultado Operativo</p>
                    </div>
                  </div>

                  {/* TARJETA DE DISTRIBUCIÓN REGLA 20/40/40 */}
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '15px', fontWeight: '700' }}>🏛️ Distribución de Utilidades y Fondos (Regla 20% Reserva / 40% - 40% Socios)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase' }}>Reserva Empresa (20%)</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>S/. {finanzas.reservaEmpresa.toFixed(2)}</div>
                      </div>
                      <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase' }}>Socio 1 - Nano (40%)</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>S/. {finanzas.repartoNano.toFixed(2)}</div>
                      </div>
                      <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase' }}>Socio 2 - Alonso (40%)</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>S/. {finanzas.repartoAlonso.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {/* NUEVO: SEMAFORIZACIÓN (SOLO VISIBLE SI ES UN MES ESPECÍFICO) */}
                  {mesFinanzas !== 'todo' && mesFinanzas !== '2026' && (
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h3 style={{ margin: '0 0 15px 0', color: '#374151', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🚦 Estado de Cuenta de Alumnos ({mesFinanzas})</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {todosLosAlumnos.map(alum => {
                          const haPagado = pagosFirebase.some(p => p.alumno === alum && p.mes === mesFinanzas);
                          return (
                            <div key={alum} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${haPagado ? '#bbf7d0' : '#fecdd3'}`, backgroundColor: haPagado ? '#f0fdf4' : '#fff1f2' }}>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151', textTransform: 'capitalize' }}>{alum}</span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: haPagado ? '#166534' : '#9f1239' }}>{haPagado ? '🟢 Al día' : '🔴 Debe'}</span>
                            </div>
                          );
                        })}
                        {todosLosAlumnos.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px' }}>No hay alumnos matriculados en ninguna clase.</p>}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
                    {/* 1. REGISTRO PENSIONES */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>🎓 Registrar Mensualidad de Alumno</h2>
                      <form onSubmit={handleAgregarPago} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Alumno</label>
                          <select value={nuevoPagoAlumno} onChange={(e) => setNuevoPagoAlumno(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                            <option value="">-- Seleccionar --</option>
                            {todosLosAlumnos.map((alum, idx) => (
                              <option key={idx} value={alum}>{alum}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Monto (S/.)</label>
                          <input type="number" placeholder="Ej: 150" value={nuevoPagoMonto} onChange={(e) => setNuevoPagoMonto(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Mes</label>
                          <select value={nuevoPagoMes} onChange={(e) => setNuevoPagoMes(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                            <option value="2026-08">Agosto 2026</option>
                            <option value="2026-07">Julio 2026</option>
                          </select>
                        </div>
                        <button type="submit" className="btn-flotante" style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Guardar Mensualidad</button>
                      </form>
                    </div>

                    {/* 2. REGISTRO MOVIMIENTOS EXTRA (SUNAT / MOVILIDAD) */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>📦 Movimiento Extra (SUNAT, Movilidad, etc)</h2>
                      <form onSubmit={handleAgregarMovimientoExtra} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Tipo de Operación</label>
                          <select value={tipoMovimiento} onChange={(e) => setTipoMovimiento(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                            <option value="ingreso_extra">🟩 Ingreso Extra (Devolución SUNAT, Venta, etc)</option>
                            <option value="gasto_extra">🟥 Gasto Extra (Movilidad, Servicios, Material)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Concepto / Descripción</label>
                          <input type="text" placeholder="Ej: Devolución Impuestos SUNAT o Pasaje Movilidad" value={conceptoMovimiento} onChange={(e) => setConceptoMovimiento(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Monto (S/.)</label>
                            <input type="number" placeholder="Ej: 200" value={montoMovimiento} onChange={(e) => setMontoMovimiento(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Mes</label>
                            <select value={mesMovimiento} onChange={(e) => setMesMovimiento(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                              <option value="2026-08">Agosto 2026</option>
                              <option value="2026-07">Julio 2026</option>
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="btn-flotante" style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Guardar Movimiento</button>
                      </form>
                    </div>

                  </div>

                  {/* Historial de Pagos Ancho Completo */}
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>📄 Historial de Pagos Emitidos ({mesFinanzas === 'todo' ? 'General' : mesFinanzas})</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                      {pagosFirebase.filter(p => matchFiltroFinanzas(p.mes))
                                    .sort((a,b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
                                    .map((pago, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '15px', fontWeight: '600', color: '#374151', textTransform: 'capitalize' }}>{pago.alumno}</span>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Reg: {new Date(pago.fechaRegistro).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>+ S/. {pago.monto.toFixed(2)}</span>
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>Mes: {pago.mes}</span>
                            </div>
                            <button onClick={() => generarPDFRecibo(pago)} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Descargar Boleta PDF">
                              📄
                            </button>
                          </div>
                        </div>
                      ))}
                      {pagosFirebase.filter(p => matchFiltroFinanzas(p.mes)).length === 0 && (
                          <p style={{ color: '#9ca3af', fontSize: '13px', gridColumn: '1 / -1', textAlign: 'center' }}>No hay ingresos registrados en este periodo.</p>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {adminTab === 'clases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>➕ Crear Nuevo Grupo o Clase</h2>
                    <form onSubmit={handleAgregarClase} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Nombre identificador</label>
                          <input type="text" placeholder="Ej: Grupo Ana" value={nuevaClaseTitulo} onChange={(e) => setNuevaClaseTitulo(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Nivel / Programa</label>
                          <input type="text" placeholder="Ej: Preparación B2" value={nuevaClaseCurso} onChange={(e) => setNuevaClaseCurso(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Días de clase</label>
                          <input type="text" placeholder="Ej: Lunes y Miércoles" value={nuevaClaseDias} onChange={(e) => setNuevaClaseDias(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Horario regular</label>
                          <input type="text" placeholder="Ej: 20:00 - 21:30" value={nuevaClaseHorario} onChange={(e) => setNuevaClaseHorario(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Tarifa por Hora (S/.)</label>
                          <input type="number" placeholder="Ej: 30" value={nuevaClaseTarifa} onChange={(e) => setNuevaClaseTarifa(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Asignar al Profesor:</label>
                          <select value={nuevaClaseProfesorId} onChange={(e) => setNuevaClaseProfesorId(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                            <option value="">-- Seleccionar --</option>
                            {profesores.map(prof => (<option key={prof.id} value={prof.id}>{prof.nombre}</option>))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Lista de Estudiantes (Separados por coma)</label>
                        <input type="text" placeholder="Ej: Ana Perez, Carlos Ruiz, Sofia Vega" value={nuevaClaseEstudiantes} onChange={(e) => setNuevaClaseEstudiantes(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <button type="submit" className="btn-flotante" style={{ padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>Crear y Asignar Clase</button>
                    </form>
                  </div>

                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', color: '#374151' }}>{verArchivadasAdmin ? '🗂️ Clases Archivadas' : '🟢 Clases Activas'}</h2>
                      <button type="button" onClick={() => setVerArchivadasAdmin(!verArchivadasAdmin)} className="btn-flotante" style={{ background: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{verArchivadasAdmin ? 'Ver Activas' : 'Ver Archivadas'}</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                      {clasesFirebase.filter(c => verArchivadasAdmin ? c.archivada : !c.archivada).map(clase => (
                        <div key={clase.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', opacity: clase.archivada ? 0.7 : 1 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '600', color: clase.archivada ? '#6b7280' : '#111827' }}>{clase.titulo}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{clase.curso}</span>
                            <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Profesor asignado (ID): {clase.profesorId.substring(0,5)}...</span>
                          </div>
                          <button onClick={() => handleToggleArchivarClase(clase.id, clase.archivada)} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', color: clase.archivada ? '#10b981' : '#f59e0b', fontWeight: '600' }}>{clase.archivada ? 'Desarchivar' : 'Archivar'}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'profesores' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>➕ Registrar Nuevo Docente</h2>
                      <form onSubmit={handleAgregarProfesor} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Nombre completo del profesor</label>
                          <input type="text" placeholder="Ej: Michael Montero" value={nombreNuevoProfesor} onChange={(e) => setNombreNuevoProfesor(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" className="btn-flotante" style={{ padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: '600', cursor: 'pointer', marginTop: '5px' }}>Crear Perfil</button>
                      </form>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>👥 Personal Registrado</h2>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {profesores.map(prof => (
                          <div key={prof.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', opacity: prof.activo !== false ? 1 : 0.5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="avatar" style={{ backgroundColor: prof.activo !== false ? prof.color : '#9ca3af', width: '36px', height: '36px', fontSize: '14px' }}>{prof.nombre.charAt(0)}</div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: prof.activo !== false ? '#374151' : '#9ca3af', textDecoration: prof.activo !== false ? 'none' : 'line-through' }}>{prof.nombre}</span>
                                <span style={{ fontSize: '11px', color: '#6b7280' }}>ID: {prof.id.substring(0,8)}</span>
                              </div>
                            </div>
                            <button onClick={() => handleToggleActivoProfesor(prof.id, prof.activo !== false)} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: prof.activo !== false ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                              {prof.activo !== false ? 'Dar de baja' : 'Reactivar'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </>
    )
  }

  if (profesorSeleccionado) {
    let mesPrefixPlanilla = "";
    if (mesPlanilla === "2026-08") mesPrefixPlanilla = "2026-08"; else if (mesPlanilla === "2026-07") mesPrefixPlanilla = "2026-07";
    const registrosMesProfesor = registrosFirebase.filter(reg => reg.profesor === profesorSeleccionado.nombre && (mesPrefixPlanilla === "" || reg.fecha?.startsWith(mesPrefixPlanilla)));
    const montoCalculadoPantalla = registrosMesProfesor.reduce((acc, reg) => acc + ((reg.horas || 0) * (reg.tarifa || 0)), 0);

    let totalNotas = 0; let countNotas = 0;
    if (claseSeleccionada) {
      const registrosDeEstaClase = registrosFirebase.filter(r => r.clase === claseSeleccionada.titulo);
      registrosDeEstaClase.forEach(reg => {
        if (reg.notas) { Object.values(reg.notas).forEach(nota => { 
          const val = typeof nota === 'object' ? getPromedio(nota) : parseFloat(nota); 
          if (!isNaN(val)) { totalNotas += parseFloat(val); countNotas++; }
        });}
      });
    }
    const promedioGrupo = countNotas > 0 ? (totalNotas / countNotas).toFixed(1) : '--';

    return (
      <>
        {estilosGlobales}
        {mostrarError && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>⚠️</span><div><h4 style={{ margin: 0 }}>Faltan datos obligatorios</h4></div></div>)}
        {mensajeExito && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>☁️</span><div><h4 style={{ margin: 0 }}>{mensajeExito}</h4></div></div>)}

        {mostrarModalExportar && (
          <>
            <div onClick={() => setMostrarModalExportar(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', top: '50%', left: '50%', width: '90%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1000, transformOrigin: 'top left', animation: 'aparecerFade 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <div><h2 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>Exportar Reporte</h2><p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Clase: <strong>{claseSeleccionada?.titulo}</strong></p></div>
                <button onClick={() => setMostrarModalExportar(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9ca3af', cursor: 'pointer' }}>✖</button>
              </div>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Selecciona el periodo:</label>
                <select value={mesExportar} onChange={(e) => setMesExportar(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontSize: '14px', color: '#111827' }}>
                  <option value="Agosto 2026">Agosto 2026</option>
                  <option value="Julio 2026">Julio 2026</option>
                  <option value="todo">📚 Exportar todo el historial</option>
                </select>
              </div>
              <button onClick={generarPDFReporteClase} className="btn-flotante" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>⬇️ Descargar PDF</button>
            </div>
          </>
        )}

        {mostrarPlanilla && (
          <>
            <div onClick={() => setMostrarPlanilla(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', top: '50%', left: '50%', width: '90%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1000, transformOrigin: 'top left', animation: 'aparecerFade 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <div><h2 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>Resumen de Pago Mensual</h2><p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Profesor: <strong>{profesorSeleccionado.nombre}</strong></p></div>
                <button onClick={() => setMostrarPlanilla(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9ca3af', cursor: 'pointer' }}>✖</button>
              </div>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Periodo a facturar:</label>
                <select value={mesPlanilla} onChange={(e) => setMesPlanilla(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontSize: '14px', color: '#111827' }}>
                  <option value="2026-08">Agosto 2026</option>
                  <option value="2026-07">Julio 2026</option>
                </select>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Monto a cobrar</p>
                <h1 style={{ margin: '8px 0', color: '#059669', fontSize: '36px' }}>S/. {montoCalculadoPantalla.toFixed(2)}</h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>Cálculo basado en las horas registradas este periodo.</p>
              </div>
              <button onClick={generarPDFPlanilla} className="btn-flotante" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>⬇️ Descargar PDF Oficial</button>
            </div>
          </>
        )}

        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f6f8' }}>
          <div style={{ width: '300px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <button onClick={handleCerrarSesionProfesor} className="btn-flotante" style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '5px 10px', marginLeft: '-10px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>← Cerrar Sesión</button>
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <img src="/boss_accredible.png" alt="Logo" style={{ width: '90px', height: 'auto', objectFit: 'contain', marginBottom: '10px' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
                <div><h2 style={{ margin: '0 0 2px 0', fontSize: '18px', color: '#111827' }}>Mis Clases</h2><p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Cursos asignados</p></div>
              </div>
            </div>
            <div style={{ padding: '16px 12px', overflowY: 'auto', flex: 1 }}>
              {misClases.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '13px', marginTop: '20px' }}>No tienes clases asignadas aún.</p>
              ) : (
                misClases.map((clase) => (
                  <div key={clase.id} onClick={() => setClaseSeleccionada(clase)} className="btn-flotante" style={{ padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', marginBottom: '8px', backgroundColor: claseSeleccionada?.id === clase.id ? '#eff6ff' : 'transparent', border: claseSeleccionada?.id === clase.id ? '1px solid #bfdbfe' : '1px solid transparent', textAlign: 'center' }}>
                    <h4 style={{ margin: 0, color: claseSeleccionada?.id === clase.id ? '#1d4ed8' : '#374151', fontSize: '14px' }}>{clase.titulo}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{clase.estudiantes.length} alumno(s) • {clase.curso}</p>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <button onClick={() => setMostrarPlanilla(true)} className="btn-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #10b981', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>📊 Ver y Exportar Pago</button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
            {claseSeleccionada ? (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}></div>
                    <div style={{ flex: 2, textAlign: 'center' }}>
                      <h1 style={{ margin: 0, color: '#111827', fontSize: '24px' }}>Registro de Clase</h1>
                      <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '15px' }}>Clase seleccionada: <strong style={{ color: '#374151' }}>{claseSeleccionada.titulo}</strong></p>
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => setMostrarModalExportar(true)} className="btn-flotante" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>📄 Exportar Reporte</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    {editandoCurso ? (
                      <>
                        <input type="text" value={nuevoNombreCurso} onChange={(e) => setNuevoNombreCurso(e.target.value)} className="input-flotante" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #3b82f6', outline: 'none', fontSize: '13px', width: '200px' }} />
                        <button onClick={handleActualizarCurso} style={{ background: '#10b981', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Guardar</button>
                        <button onClick={() => setEditandoCurso(false)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '14px', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '6px 16px', borderRadius: '12px', fontWeight: '600' }}>Nivel actual: {claseSeleccionada.curso}</span>
                        <button onClick={() => {setNuevoNombreCurso(claseSeleccionada.curso); setEditandoCurso(true);}} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '14px', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>✏️</button>
                        <span style={{ fontSize: '14px', color: '#047857', backgroundColor: '#d1fae5', padding: '6px 16px', borderRadius: '12px', fontWeight: '600' }}>📈 Promedio Histórico: {promedioGrupo}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', color: '#374151', marginBottom: '20px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>Desempeño Individual</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {claseSeleccionada.estudiantes.map((estudiante, index) => (
                      <div key={index} style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                          <h4 style={{ margin: 0, color: '#111827', fontSize: '16px', minWidth: '140px', textAlign: 'center', textTransform: 'capitalize' }}>{estudiante}</h4>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => setAsistencia({...asistencia, [estudiante]: 'asistio'})} style={obtenerEstiloBoton(estudiante, 'asistio', '#86efac', '#dcfce7', '#166534')}>Asistió</button>
                            <button onClick={() => setAsistencia({...asistencia, [estudiante]: 'no-asistio'})} style={obtenerEstiloBoton(estudiante, 'no-asistio', '#fca5a5', '#fee2e2', '#991b1b')}>No asistió</button>
                            <button onClick={() => setAsistencia({...asistencia, [estudiante]: 'reprogramo'})} style={obtenerEstiloBoton(estudiante, 'reprogramo', '#fcd34d', '#fef3c7', '#92400e')}>Reprogramó</button>
                          </div>
                        </div>

                        {(asistencia[estudiante] === 'asistio' || asistencia[estudiante] === 'reprogramo') && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '600', width: '100%', textAlign: 'center', marginBottom: '4px' }}>
                              Evaluación Diaria (1-20) {asistencia[estudiante] === 'reprogramo' ? '- Clase Reprogramada' : ''}
                            </div>
                            {['oral', 'grammar', 'reading', 'listening', 'writing'].map(skill => (
                              <div key={skill} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase' }}>{skill}</span>
                                <select
                                  value={notas[estudiante]?.[skill] || ''}
                                  onChange={(e) => setNotas({...notas, [estudiante]: {...(notas[estudiante] || {}), [skill]: e.target.value}})}
                                  style={{ width: '50px', padding: '6px 4px', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '13px', textAlign: 'center', outline: 'none', backgroundColor: 'white', color: '#111827', cursor: 'pointer' }}
                                >
                                  <option value="">--</option>
                                  {[...Array(20)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ width: '100%' }}>
                          <input className="input-flotante" type="text" placeholder={`Observaciones sobre ${estudiante} (Opcional)`} value={obsIndividual[estudiante] || ''} onChange={(e) => setObsIndividual({...obsIndividual, [estudiante]: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px', textAlign: 'center' }}>Fecha (Real)</label>
                    <input className="input-flotante" type="date" value={fechaClase} onChange={(e) => setFechaClase(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px', textAlign: 'center' }}>Horas (Real)</label>
                    <input className="input-flotante" type="number" step="0.5" placeholder="Ej: 1.5" value={horasClase} onChange={(e) => setHorasClase(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px', textAlign: 'center' }}>Tarifa</label>
                    <input className="input-flotante" type="text" value={`S/. ${claseSeleccionada.tarifa} / hr`} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', color: '#6b7280', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151', fontSize: '14px', textAlign: 'center' }}>Observaciones Generales</label>
                  <textarea className="input-flotante" rows="3" placeholder="Detalles sobre temas vistos, tareas, etc..." value={obsGeneral} onChange={(e) => setObsGeneral(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
                </div>
                <button onClick={handleGuardarRegistro} className="btn-flotante" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Guardar Registro Completo</button>
              </div>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                <h3>Selecciona una clase del panel izquierdo para comenzar</h3>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

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

      <div style={{ textAlign: 'center', padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '25px', left: '30px' }}>
          <button onClick={() => setAccesoGlobal(false)} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>🚪 Salir</button>
        </div>
        <div style={{ position: 'absolute', top: '25px', right: '30px' }}>
          <button onClick={() => setMostrarModalAdmin(true)} className="btn-flotante" style={{ background: '#111827', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>⚙️ Admin</button>
        </div>
        <div style={{ marginTop: '20px', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/boss_accredible.png" alt="Logo" style={{ width: '120px', height: 'auto', marginBottom: '15px' }} onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
          <h1 style={{ color: '#1f2937', margin: '0 0 8px 0', fontWeight: '600', fontSize: '30px' }}>Boss Language Center</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>Selecciona tu perfil docente</p>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', maxWidth: '750px', margin: '0 auto', paddingBottom: '40px' }}>
          {profesoresActivos.map((profesor) => (
            <div key={profesor.id} onClick={() => setProfesorAAutenticar(profesor)} className="tarjeta-notificacion">
              <div className="avatar" style={{ backgroundColor: profesor.color }}>{profesor.nombre.charAt(0)}</div>
              <div className="textos" style={{ textAlign: 'left' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1f1f1f', fontWeight: '600' }}>{profesor.nombre}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#5f6368' }}>Language Teacher</p>
              </div>
            </div>
          ))}
          {profesoresActivos.length === 0 && (
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

export default App