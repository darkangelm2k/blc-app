import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

function App() {
  // 1. ESTADOS PRINCIPALES
  const [modoIngreso, setModoIngreso] = useState('inicio');
  const [accesoGlobal, setAccesoGlobal] = useState(false);
  const [usuarioGlobal, setUsuarioGlobal] = useState('');
  const [claveGlobal, setClaveGlobal] = useState('');
  const [errorLoginGlobal, setErrorLoginGlobal] = useState(false);

  const [profesorAAutenticar, setProfesorAAutenticar] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [errorPin, setErrorPin] = useState(false);

  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);

  const [loginAlumnoTipoDoc, setLoginAlumnoTipoDoc] = useState('DNI');
  const [loginAlumnoNumDoc, setLoginAlumnoNumDoc] = useState('');
  const [errorLoginAlumno, setErrorLoginAlumno] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [mesFiltroAlumno, setMesFiltroAlumno] = useState('todo');

  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const [mostrarModalExportar, setMostrarModalExportar] = useState(false);
  const [mesExportar, setMesExportar] = useState('todo');
  const [mostrarPlanilla, setMostrarPlanilla] = useState(false);
  const [mesPlanilla, setMesPlanilla] = useState('2026-08');

  // 2. ESTADOS DE REGISTRO
  const [asistencia, setAsistencia] = useState({});
  const [notas, setNotas] = useState({});
  const [obsIndividual, setObsIndividual] = useState({});
  const [fechaClase, setFechaClase] = useState('');
  const [horasClase, setHorasClase] = useState('');
  const [obsGeneral, setObsGeneral] = useState('');

  // 3. BASES DE DATOS FIREBASE
  const [profesores, setProfesores] = useState([]);
  const [alumnosFirebase, setAlumnosFirebase] = useState([]);
  const [clasesFirebase, setClasesFirebase] = useState([]);
  const [registrosFirebase, setRegistrosFirebase] = useState([]);
  const [pagosFirebase, setPagosFirebase] = useState([]);
  const [movimientosExtra, setMovimientosExtra] = useState([]);

  // 4. ESTADOS PANEL ADMIN
  const [vistaAdmin, setVistaAdmin] = useState(false);
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState(false);
  const [claveAdminInput, setClaveAdminInput] = useState('');
  const [errorAdminPin, setErrorAdminPin] = useState(false);
  const [adminTab, setAdminTab] = useState('reportes');

  const [nombreNuevoProfesor, setNombreNuevoProfesor] = useState('');
  const [nuevoAlumnoNombre, setNuevoAlumnoNombre] = useState('');
  const [nuevoAlumnoTipoDoc, setNuevoAlumnoTipoDoc] = useState('DNI');
  const [nuevoAlumnoNumDoc, setNuevoAlumnoNumDoc] = useState('');
  const [nuevoAlumnoEmail, setNuevoAlumnoEmail] = useState('');
  const [busquedaDirectorio, setBusquedaDirectorio] = useState('');

  const [nuevaClaseTitulo, setNuevaClaseTitulo] = useState('');
  const [nuevaClaseCurso, setNuevaClaseCurso] = useState('');
  const [nuevaClaseTarifa, setNuevaClaseTarifa] = useState('');
  const [nuevaClaseDias, setNuevaClaseDias] = useState('');
  const [nuevaClaseHorario, setNuevaClaseHorario] = useState('');
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
  const [nuevaClaseProfesorId, setNuevaClaseProfesorId] = useState('');
  const [busquedaEstudiantesClase, setBusquedaEstudiantesClase] = useState('');

  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [mesFiltroBusqueda, setMesFiltroBusqueda] = useState('todo');
  const [tipoBusqueda, setTipoBusqueda] = useState('alumno');

  const [editandoCurso, setEditandoCurso] = useState(false);
  const [nuevoNombreCurso, setNuevoNombreCurso] = useState('');
  const [verArchivadasAdmin, setVerArchivadasAdmin] = useState(false);

  const [nuevoPagoAlumno, setNuevoPagoAlumno] = useState('');
  const [nuevoPagoMonto, setNuevoPagoMonto] = useState('');
  const [nuevoPagoMes, setNuevoPagoMes] = useState('2026-08');
  const [mesFinanzas, setMesFinanzas] = useState('2026-08');

  const [tipoMovimiento, setTipoMovimiento] = useState('ingreso_extra');
  const [conceptoMovimiento, setConceptoMovimiento] = useState('');
  const [montoMovimiento, setMontoMovimiento] = useState('');
  const [mesMovimiento, setMesMovimiento] = useState('2026-08');

  const [textoImportar, setTextoImportar] = useState('');
  const [alumnoImportar, setAlumnoImportar] = useState('');
  const [claseImportar, setClaseImportar] = useState('');
  const [profesorImportar, setProfesorImportar] = useState('');
  const [procesandoImportacion, setProcesandoImportacion] = useState(false);

  const [mostrarModalExamen, setMostrarModalExamen] = useState(false);
  const [examenAlumno, setExamenAlumno] = useState('');
  const [examenNivel, setExamenNivel] = useState('');
  const [examenNota, setExamenNota] = useState('');
  const [examenFecha, setExamenFecha] = useState('');
  const [busquedaAlumnoExamen, setBusquedaAlumnoExamen] = useState('');

  const [editandoRegistroId, setEditandoRegistroId] = useState(null);
  const [editandoClaseId, setEditandoClaseId] = useState(null);

  const [editandoAlumnoId, setEditandoAlumnoId] = useState(null);
  const [editAlumnoNombre, setEditAlumnoNombre] = useState('');
  const [editAlumnoTipoDoc, setEditAlumnoTipoDoc] = useState('DNI');
  const [editAlumnoNumDoc, setEditAlumnoNumDoc] = useState('');
  const [editAlumnoEmail, setEditAlumnoEmail] = useState('');

  // ==========================================
  // FUNCIONES DE UTILIDAD Y BLINDAJE
  // ==========================================
  const getInitial = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.charAt(0).toUpperCase();
  };

  const getFirstName = (name) => {
    if (!name || typeof name !== 'string') return 'Profesor';
    return name.split(' ')[0];
  };

  const getShortId = (id, len = 5) => {
    if (!id || typeof id !== 'string') return 'N/A';
    return id.substring(0, len);
  };

  const safeIncludes = (str, search) => {
    return String(str || '').toLowerCase().includes(String(search || '').toLowerCase());
  };

  const formatearNombre = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.trim().toLowerCase().split(' ').map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '').join(' ');
  };

  const parseFechaUniversal = (fechaStr) => {
    if (!fechaStr || typeof fechaStr !== 'string') return '';
    if (fechaStr.includes('/')) {
       const parts = fechaStr.split('/');
       if (parts.length === 3) {
           return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
       }
    }
    return fechaStr; 
  };

  const opcionesMesesGlobal = [];
  for(let y = 2026; y >= 2024; y--) {
      for(let m = 12; m >= 1; m--) {
          opcionesMesesGlobal.push(`${y}-${String(m).padStart(2, '0')}`);
      }
  }

  const formatMesTexto = (yyyy_mm) => {
      if (!yyyy_mm || typeof yyyy_mm !== 'string') return '';
      const parts = yyyy_mm.split('-');
      if (parts.length < 2) return yyyy_mm;
      const [y, m] = parts;
      const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${nombresMeses[parseInt(m) - 1] || ''} ${y}`;
  };

  const triggerError = (msg) => {
    setMensajeError(msg); 
    setMostrarError(true);
    setTimeout(() => { setMostrarError(false); setMensajeError(''); }, 3500);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const profesSnap = await getDocs(collection(db, "profesores"));
        setProfesores(profesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const alumnosSnap = await getDocs(collection(db, "alumnos"));
        setAlumnosFirebase(alumnosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''))));

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

  const todosLosAlumnos = alumnosFirebase
    .map(a => a.nombre)
    .filter(Boolean)
    .sort((a, b) => String(a).localeCompare(String(b)));
  
  const alumnosActivos = alumnosFirebase
    .filter(a => a.activo !== false && a.nombre)
    .map(a => a.nombre)
    .sort((a, b) => String(a).localeCompare(String(b)));
    // ==========================================
  // FUNCIONES DE CÁLCULO Y LÓGICA DE NEGOCIO
  // ==========================================
  const getPromedio = (notasDato) => {
    if (!notasDato) return '--';
    if (typeof notasDato === 'string' || typeof notasDato === 'number') {
       const p = parseFloat(notasDato);
       return isNaN(p) ? '--' : p.toFixed(1);
    }
    const vals = Object.values(notasDato).map(Number).filter(n => !isNaN(n) && n > 0);
    return vals.length > 0 ? (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1) : '--';
  };

  const formatNotasStr = (n) => {
    if (!n) return '--';
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    const prom = getPromedio(n);
    return `${prom} (O:${n.oral||'-'} G:${n.grammar||'-'} R:${n.reading||'-'} L:${n.listening||'-'} W:${n.writing||'-'})`;
  };

  const matchFiltroFinanzas = (fechaDato) => {
    if (!fechaDato) return false;
    if (mesFinanzas === 'todo') return true;
    const f = parseFechaUniversal(fechaDato);
    if (['2026', '2025', '2024'].includes(mesFinanzas)) return f.startsWith(mesFinanzas);
    return f.startsWith(mesFinanzas); 
  };

  const handleProcesarImportacion = async (e) => {
    e.preventDefault();
    if (!textoImportar || !claseImportar || !profesorImportar || !alumnoImportar) {
      triggerError('Llena todos los campos obligatorios y pega los datos del Excel.'); return;
    }
    if (alumnoImportar.length > 60) {
      triggerError('El nombre del alumno es muy largo. ¿Pegaste la tabla en la casilla equivocada?'); return;
    }

    setProcesandoImportacion(true);
    const filas = textoImportar.trim().split('\n');
    let nuevosAlumnosRegistrados = 0; let registrosGuardados = 0;

    try {
      const claseRef = clasesFirebase.find(c => c.id === claseImportar);
      const nivelClase = claseRef ? claseRef.curso : '--';
      const tarifaClase = claseRef ? claseRef.tarifa : 0;
      const profesorName = profesores.find(p => p.id === profesorImportar)?.nombre || 'Desconocido';
      
      const nombreAlumno = formatearNombre(alumnoImportar);

      let alumnoExiste = alumnosFirebase.some(a => String(a.nombre || '').toLowerCase() === nombreAlumno.toLowerCase());
      if (!alumnoExiste) {
        await addDoc(collection(db, "alumnos"), { nombre: nombreAlumno, tipoDoc: 'DNI', numDoc: 'PENDIENTE', email: '', fechaRegistro: new Date().toISOString(), activo: true });
        nuevosAlumnosRegistrados++; alumnosFirebase.push({nombre: nombreAlumno, tipoDoc: 'DNI', numDoc: 'PENDIENTE', email: '', activo: true}); 
      }

      if (claseRef && !(claseRef.estudiantes || []).includes(nombreAlumno)) {
         const claseDocRef = doc(db, "clases", claseRef.id);
         const nuevosEstudiantes = [...(claseRef.estudiantes || []), nombreAlumno];
         await updateDoc(claseDocRef, { estudiantes: nuevosEstudiantes });
         claseRef.estudiantes = nuevosEstudiantes; 
      }

      for (let i = 0; i < filas.length; i++) {
        const filaText = filas[i].trim();
        if(!filaText) continue;
        
        const columnas = filaText.split('\t'); 
        if (columnas.length < 5) continue; 

        let fechaCruda = String(columnas[0]).trim();
        if (!fechaCruda.match(/\d{2,4}[-/]\d{1,2}[-/]\d{1,4}/)) continue;

        let fecha = fechaCruda.split(' ')[0]; 
        if(fecha.includes('/')) {
            const parts = fecha.split('/');
            if(parts.length === 3) fecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        
        const getNota = (val) => { const v = String(val||'').trim(); return (v === '' || v.toLowerCase() === 'nan' || v === '-') ? '' : v; };
        let oral = getNota(columnas[1]); let grammar = getNota(columnas[2]); let reading = getNota(columnas[3]); let listening = getNota(columnas[4]); let writing = getNota(columnas[5]);
        
        let asist = 'asistio'; 
        if(!oral && !grammar && !reading && !listening && !writing) asist = 'no-asistio';

        if (fecha && nombreAlumno) {
          const notasFormat = (asist === 'asistio') ? { oral, grammar, reading, listening, writing } : null;
          await addDoc(collection(db, "registrosClases"), {
            profesor: profesorName, clase: claseRef.titulo, nivel: nivelClase, fecha: fecha,
            horas: 1.5, tarifa: tarifaClase, asistencia: { [nombreAlumno]: asist },
            notas: notasFormat ? { [nombreAlumno]: notasFormat } : {},
            observacionesIndividuales: {}, observacionGeneral: 'Historial migrado de Excel', fechaRegistro: new Date().toISOString()
          });
          registrosGuardados++;
        }
      }
      setTextoImportar(''); setAlumnoImportar(''); 
      setMensajeExito(`¡Migración perfecta! ${nuevosAlumnosRegistrados} creados, ${registrosGuardados} guardados.`); 
      setTimeout(() => setMensajeExito(''), 6000);
      const alumnosSnap = await getDocs(collection(db, "alumnos")); setAlumnosFirebase(alumnosSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => String(a.nombre||'').localeCompare(String(b.nombre||''))));
      const regSnap = await getDocs(collection(db, "registrosClases")); setRegistrosFirebase(regSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { 
      triggerError('Error al importar. Revisa el formato de los datos copiados.'); 
    } finally { 
      setProcesandoImportacion(false); 
    }
  };

  const handleGuardarExamen = async (e) => {
    e.preventDefault();
    if (!examenAlumno || !examenNivel || !examenNota || !examenFecha) {
      triggerError("Por favor completa todos los campos del examen."); return;
    }
    try {
      await addDoc(collection(db, "registrosClases"), {
        profesor: profesorSeleccionado.nombre, clase: "FINAL PROJECT EXAM", nivel: examenNivel, fecha: examenFecha,
        horas: 1, tarifa: 0, asistencia: { [examenAlumno]: 'asistio' }, notas: { [examenAlumno]: examenNota }, 
        observacionesIndividuales: { [examenAlumno]: "Proyecto Final / Examen" }, observacionGeneral: "Evaluación Final", fechaRegistro: new Date().toISOString()
      });
      setMensajeExito("¡Examen Final guardado con éxito! 🎓✅"); setTimeout(() => setMensajeExito(''), 4000);
      setMostrarModalExamen(false); setExamenAlumno(''); setExamenNivel(''); setExamenNota(''); setExamenFecha(''); setBusquedaAlumnoExamen('');
      const regSnap = await getDocs(collection(db, "registrosClases")); setRegistrosFirebase(regSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { 
      triggerError("Error al guardar el examen. Revisa tu conexión."); 
    }
  };

  const handleActualizarAlumno = async (id, oldName) => {
    if(!editAlumnoNombre || !editAlumnoNumDoc) { triggerError("El nombre y el documento son obligatorios."); return; }
    
    const nombreLimpio = formatearNombre(editAlumnoNombre); 

    try {
      await updateDoc(doc(db, "alumnos", id), {
        nombre: nombreLimpio, tipoDoc: editAlumnoTipoDoc, numDoc: editAlumnoNumDoc, email: editAlumnoEmail || ''
      });
      setAlumnosFirebase(prev => prev.map(a => a.id === id ? {...a, nombre: nombreLimpio, tipoDoc: editAlumnoTipoDoc, numDoc: editAlumnoNumDoc, email: editAlumnoEmail || ''} : a));

      if (nombreLimpio !== oldName) {
         const clasesToUpdate = clasesFirebase.filter(c => (c.estudiantes||[]).includes(oldName));
         for (let c of clasesToUpdate) {
            const newEstudiantes = c.estudiantes.map(e => e === oldName ? nombreLimpio : e);
            await updateDoc(doc(db, "clases", c.id), { estudiantes: newEstudiantes });
         }
         const regsToUpdate = registrosFirebase.filter(r => r.asistencia && r.asistencia[oldName]);
         for (let r of regsToUpdate) {
             const newAsist = {...r.asistencia}; newAsist[nombreLimpio] = newAsist[oldName]; delete newAsist[oldName];
             const newNotas = {...(r.notas || {})}; if(newNotas[oldName]) { newNotas[nombreLimpio] = newNotas[oldName]; delete newNotas[oldName]; }
             const newObs = {...(r.observacionesIndividuales || {})}; if(newObs[oldName]) { newObs[nombreLimpio] = newObs[oldName]; delete newObs[oldName]; }
             await updateDoc(doc(db, "registrosClases", r.id), { asistencia: newAsist, notas: newNotas, observacionesIndividuales: newObs });
         }
         const cSnap = await getDocs(collection(db, "clases")); setClasesFirebase(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
         const rSnap = await getDocs(collection(db, "registrosClases")); setRegistrosFirebase(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      setMensajeExito("¡Datos actualizados perfectamente! ✏️✅"); setTimeout(() => setMensajeExito(''), 4000);
      setEditandoAlumnoId(null);
    } catch(err) { 
      triggerError("Error al guardar cambios."); 
    }
  };

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
    const cuadroHonor = [...arrAlumnos].filter(a => parseFloat(a.promedio) > 0).sort((a,b) => parseFloat(b.promedio) - parseFloat(a.promedio)).slice(0, 5);
    return { enRiesgo, cuadroHonor };
  };

  const calcularMetricasDocentes = () => {
    const statsProfesores = {};
    profesores.filter(p => p.activo !== false).forEach(prof => {
      statsProfesores[prof.nombre] = { horasTotales: 0, totalAsistencias: 0, totalRegistrosAsistencia: 0, sumaNotas: 0, cantidadNotas: 0, color: prof.color };
    });
    registrosFirebase.forEach(reg => {
      if (mesFiltroBusqueda !== 'todo') {
         const f = parseFechaUniversal(reg.fecha);
         if (['2026','2025','2024'].includes(mesFiltroBusqueda) && !f.startsWith(mesFiltroBusqueda)) return;
         if (!['2026','2025','2024'].includes(mesFiltroBusqueda) && !f.startsWith(mesFiltroBusqueda)) return;
      }
      const profNombre = reg.profesor;
      if (!profNombre || !statsProfesores[profNombre]) return;
      
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
  };

  const calcularFinanzas = () => {
    let ingresosPensiones = 0; let ingresosExtra = 0; let egresosNomina = 0; let egresosExtra = 0;
    pagosFirebase.forEach(pago => { if (matchFiltroFinanzas(pago.mes)) ingresosPensiones += Number(pago.monto || 0); });
    registrosFirebase.forEach(reg => { if (matchFiltroFinanzas(reg.fecha)) egresosNomina += (Number(reg.horas || 0) * Number(reg.tarifa || 0)); });
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
    return { ingresosPensiones, ingresosExtra, totalIngresos, egresosNomina, egresosExtra, totalEgresos, balance, reservaEmpresa, repartoDaniel, repartoMichael };
  };
  // ==========================================
  // FUNCIONES DE EXPORTACIÓN (PDF Y EXCEL)
  // ==========================================
  const agregarEncabezadoPDF = async (doc, titulo, subtitulos) => {
    let currentY = 15;
    try {
      const img = new Image(); 
      img.src = '/boss_accredible.png';
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const canvas = document.createElement('canvas'); 
      canvas.width = img.width; 
      canvas.height = img.height;
      const ctx = canvas.getContext('2d'); 
      ctx.fillStyle = '#FFFFFF'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height); 
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = 45; 
      const imgHeight = (img.height / img.width) * imgWidth; 
      doc.addImage(imgData, 'JPEG', 14, 10, imgWidth, imgHeight); 
      currentY = 10 + imgHeight + 15; 
    } catch (e) { 
      currentY = 25; 
    }
    doc.setFontSize(24); 
    doc.setTextColor(37, 99, 235); 
    doc.text(titulo, 14, currentY);
    currentY += 10; 
    doc.setFontSize(11); 
    doc.setTextColor(55, 65, 81);
    subtitulos.forEach((texto) => { 
      doc.text(texto, 14, currentY); 
      currentY += 6; 
    });
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
    doc.text(`Alumno: ${String(pago.alumno || 'Alumno').toUpperCase()}`, 14, startY + 20); 
    doc.text(`Mes Cancelado: ${pago.mes || '--'}`, 14, startY + 28); 
    doc.text(`Fecha de Registro en Sistema: ${pago.fechaRegistro ? new Date(pago.fechaRegistro).toLocaleDateString() : '--'}`, 14, startY + 36);
    doc.setFontSize(18); doc.setTextColor(5, 150, 105); doc.text(`Total Pagado: S/. ${Number(pago.monto || 0).toFixed(2)}`, 14, startY + 55);
    doc.setFontSize(10); doc.setTextColor(156, 163, 175); doc.text("Documento interno y oficial de Boss Language Center SAC.", 14, startY + 75);
    doc.save(`Recibo_BLC_${String(pago.alumno || 'Pago').replace(/\s/g, '_')}_${pago.mes || ''}.pdf`);
  };

  const generarPDFReporteAlumnoUnico = async () => {
    const doc = new jsPDF();
    let registrosAlumno = registrosFirebase.filter(reg => reg.asistencia && reg.asistencia[alumnoSeleccionado]);
    if (mesFiltroAlumno !== 'todo') {
        registrosAlumno = registrosAlumno.filter(reg => {
          const f = parseFechaUniversal(reg.fecha);
          if(['2026', '2025', '2024'].includes(mesFiltroAlumno)) return f.startsWith(mesFiltroAlumno);
          return f.startsWith(mesFiltroAlumno);
        });
    }
    registrosAlumno.sort((a,b) => (new Date(parseFechaUniversal(a.fecha)).getTime() || 0) - (new Date(parseFechaUniversal(b.fecha)).getTime() || 0));
    
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
    const periodoStr = mesFiltroAlumno === 'todo' ? 'Historial Completo' : mesFiltroAlumno;

    const startY = await agregarEncabezadoPDF(doc, "Libreta de Notas Oficial", [
      `Alumno: ${String(alumnoSeleccionado || '').toUpperCase()}`, 
      `Periodo Evaluado: ${periodoStr}`, 
      `Promedio Global: ${promedioGlobal}`, 
      `Asistencia Total: ${asistenciaPorcentaje}%`, 
      `Generado: ${new Date().toLocaleDateString()}`
    ]);

    const tableData = [];
    registrosAlumno.forEach(reg => {
        const estado = reg.asistencia[alumnoSeleccionado];
        const observacion = reg.observacionesIndividuales?.[alumnoSeleccionado] || reg.observacionGeneral || '--';
        const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alumnoSeleccionado]) : '--';
        tableData.push([reg.fecha || '--', reg.clase || '--', String(estado || '--').replace('-', ' '), notaCol, observacion]);
    });

    autoTable(doc, { startY: startY, head: [['Fecha', 'Clase', 'Asist.', 'Promedio y Detalles', 'Observaciones']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8, cellPadding: 3 }});
    doc.save(`Libreta_${String(alumnoSeleccionado || 'Alumno').replace(/\s/g, '_')}.pdf`);
  };

  const descargarRespaldoNuclear = () => {
    const backupData = { 
      fechaGeneracion: new Date().toISOString(), 
      centro: "Boss Language Center SAC", 
      baseDeDatos: { 
        profesores: profesores, 
        alumnos: alumnosFirebase, 
        clases: clasesFirebase, 
        registros_academicos: registrosFirebase, 
        pagos_ingresos: pagosFirebase, 
        movimientos_financieros: movimientosExtra 
      }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); 
    const link = document.createElement('a'); 
    link.href = url;
    link.download = `Respaldo_Nuclear_BLC_${new Date().toISOString().split('T')[0]}.json`; 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
    setMensajeExito('¡Backup Nuclear descargado con éxito! 💽✅'); 
    setTimeout(() => setMensajeExito(''), 4000);
  };

  const generarPDFPlanilla = async () => {
    const doc = new jsPDF();
    const nombreMes = formatMesTexto(mesPlanilla);
    const startY = await agregarEncabezadoPDF(doc, "Resumen de Pago Docente", [`Profesor: ${profesorSeleccionado?.nombre || 'Docente'}`, `Periodo: ${nombreMes}`, `Centro: Boss Language Center SAC`]);
    const registrosMes = registrosFirebase.filter(reg => {
      if(reg.profesor !== profesorSeleccionado?.nombre) return false;
      if(mesPlanilla === "") return true;
      const f = parseFechaUniversal(reg.fecha);
      return f.startsWith(mesPlanilla);
    });
    let totalPagar = 0;
    const tableData = registrosMes.map(reg => {
      const monto = (reg.horas || 0) * (reg.tarifa || 0); totalPagar += monto;
      return [reg.fecha || '--', reg.clase || '--', `${reg.horas || 0} hrs`, `S/. ${reg.tarifa || 0}`, `S/. ${monto.toFixed(2)}`];
    });
    autoTable(doc, { startY: startY, head: [['Fecha', 'Clase', 'Horas Impartidas', 'Tarifa/Hora', 'Subtotal']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 9, cellPadding: 3 }});
    doc.setFontSize(16); doc.setTextColor(5, 150, 105); doc.text(`Total a Facturar: S/. ${totalPagar.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 15);
    doc.setFontSize(10); doc.setTextColor(75, 85, 99); doc.text("Instrucciones: Emitir el Recibo por Honorarios a Boss Language Center SAC (RUC: 20603806795).", 14, doc.lastAutoTable.finalY + 25);
    doc.save(`Planilla_${String(profesorSeleccionado?.nombre || 'Docente').replace(/\s/g, '_')}_${nombreMes.replace(/\s/g, '_')}.pdf`);
    setMostrarPlanilla(false); 
    setMensajeExito('¡Planilla generada exitosamente! 💰✅'); 
    setTimeout(() => setMensajeExito(''), 4000);
  };

  const generarPDFReporteClase = async () => {
    const doc = new jsPDF();
    let periodoStr = mesExportar === 'todo' ? 'Historial Completo' : (mesExportar.length === 4 ? `Año ${mesExportar}` : formatMesTexto(mesExportar));
    const startY = await agregarEncabezadoPDF(doc, "Reporte Académico de Grupo", [`Clase: ${claseSeleccionada?.titulo || 'Grupo'}`, `Nivel Actual: ${claseSeleccionada?.curso || '--'}`, `Profesor a cargo: ${profesorSeleccionado?.nombre || '--'}`, `Periodo: ${periodoStr}`]);
    const registrosFiltrados = registrosFirebase.filter(reg => {
      if(reg.clase !== claseSeleccionada?.titulo) return false;
      if(mesExportar === "todo") return true;
      const f = parseFechaUniversal(reg.fecha);
      return f.startsWith(mesExportar);
    }).sort((a, b) => (new Date(parseFechaUniversal(a.fecha)).getTime() || 0) - (new Date(parseFechaUniversal(b.fecha)).getTime() || 0));
    
    const tableData = [];
    registrosFiltrados.forEach(reg => {
      const estudiantes = Object.keys(reg.asistencia || {});
      estudiantes.forEach(est => {
        const estado = reg.asistencia[est];
        const observacion = reg.observacionesIndividuales?.[est] || reg.observacionGeneral || '--';
        const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[est]) : '--';
        tableData.push([reg.fecha || '--', est, String(estado || '--').replace('-', ' '), notaCol, observacion]);
      });
    });
    autoTable(doc, { startY: startY, head: [['Fecha', 'Alumno', 'Asist.', 'Promedio y Detalles', 'Observaciones']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8, cellPadding: 3 }});
    doc.save(`Reporte_${String(claseSeleccionada?.titulo || 'Grupo').replace(/\s/g, '_')}.pdf`);
    setMostrarModalExportar(false); 
    setMensajeExito('¡Reporte exportado con éxito! 📄✅'); 
    setTimeout(() => setMensajeExito(''), 4000);
  };

  const generarPDFAdmin = async (resultados) => {
    if(resultados.length === 0) return;
    const doc = new jsPDF();
    let periodoStr = mesFiltroBusqueda === 'todo' ? 'Historial Completo' : (mesFiltroBusqueda.length === 4 ? `Año ${mesFiltroBusqueda}` : formatMesTexto(mesFiltroBusqueda));
    let tituloPDF = ""; let subtitulos = [];

    if (tipoBusqueda === 'alumno') {
      tituloPDF = "Expediente Académico del Alumno"; let nombreMayus = terminoBusqueda ? String(terminoBusqueda).toUpperCase() : 'General';
      subtitulos = [`Alumno: ${nombreMayus}`, `Generado por: Coordinación Académica`, `Periodo: ${periodoStr}`];
    } else if (tipoBusqueda === 'profesor') {
      tituloPDF = "Expediente del Profesor"; let profMayus = terminoBusqueda ? String(terminoBusqueda).toUpperCase() : 'General';
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
      if (tipoBusqueda === 'alumno' && String(terminoBusqueda).trim() !== '') {
         const match = nombres.find(n => String(n || '').toLowerCase().includes(String(terminoBusqueda).toLowerCase()));
         if (match) alumnosAMostrar = [match];
      }
      alumnosAMostrar.forEach(alum => {
         const estado = reg.asistencia?.[alum];
         const observacion = reg.observacionesIndividuales?.[alum] || reg.observacionGeneral || '--';
         const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alum]) : '--';
         tableData.push([reg.fecha || '--', alum || '--', String(estado || '--').replace('-', ' '), notaCol, observacion]);
      });
    });
    autoTable(doc, { startY: startY, head: [['Fecha', 'Alumno', 'Asist.', 'Promedio y Detalles', 'Observaciones']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8, cellPadding: 3 } });
    doc.save(`Reporte_Admin_${String(terminoBusqueda || 'BLC').replace(/\s/g, '_')}.pdf`);
    setMensajeExito('¡Reporte exportado con formato estándar! 📊✅'); setTimeout(() => setMensajeExito(''), 4000);
  };

  const generarExcelAdmin = (resultados) => {
    if(resultados.length === 0) return;
    let csvContent = "Fecha,Alumno,Clase/Nivel,Profesor,Asistencia,Oral,Grammar,Reading,Listening,Writing,Promedio Diario,Observaciones\n";
    resultados.forEach(reg => {
      const nombres = Object.keys(reg.asistencia || {});
      let alumnosAMostrar = nombres;
      if (tipoBusqueda === 'alumno' && String(terminoBusqueda).trim() !== '') {
         const match = nombres.find(n => String(n || '').toLowerCase().includes(String(terminoBusqueda).toLowerCase()));
         if (match) alumnosAMostrar = [match];
      }
      alumnosAMostrar.forEach(alum => {
         const estado = String(reg.asistencia?.[alum] || '--').replace('-', ' ');
         const obs = String(reg.observacionesIndividuales?.[alum] || reg.observacionGeneral || '--').replace(/,/g, ' '); 
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
         csvContent += `${reg.fecha || '--'},${alum},${reg.clase || '--'} (${nivelReal}),${reg.profesor || '--'},${estado},${o},${g},${r},${l},${w},${prom},${obs}\n`;
      });
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement("a"); 
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url); 
    link.setAttribute("download", `Reporte_Admin_${String(terminoBusqueda || 'BLC').replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setMensajeExito('¡Excel exportado correctamente! 📈✅'); setTimeout(() => setMensajeExito(''), 4000);
  };

  // ==========================================
  // OPERACIONES DE ESTADO Y FIREBASE
  // ==========================================
  const resultadosBusqueda = registrosFirebase.filter(reg => {
    if (String(terminoBusqueda).trim() === '') return false;
    
    if (tipoBusqueda === 'alumno') {
      const nombresAlumnos = Object.keys(reg.asistencia || {});
      const alumnoEncontrado = nombresAlumnos.find(nombre => safeIncludes(nombre, terminoBusqueda));
      if (!alumnoEncontrado) return false;
    } else if (tipoBusqueda === 'clase') {
      const matchClase = safeIncludes(reg.clase, terminoBusqueda);
      if (!matchClase) return false;
    } else if (tipoBusqueda === 'profesor') {
      const matchProfesor = safeIncludes(reg.profesor, terminoBusqueda);
      if (!matchProfesor) return false;
    } else if (tipoBusqueda === 'fecha') {
      const term = String(terminoBusqueda).trim().toLowerCase().replace(/\s/g, '');
      const f1 = String(reg.fecha || '').toLowerCase().replace(/\s/g, '');
      const f2 = parseFechaUniversal(reg.fecha).toLowerCase().replace(/\s/g, '');
      if (!f1.includes(term) && !f2.includes(term)) return false;
    }

    if (mesFiltroBusqueda !== 'todo') { 
      const f = parseFechaUniversal(reg.fecha);
      if (['2026', '2025', '2024'].includes(mesFiltroBusqueda)) return f.startsWith(mesFiltroBusqueda);
      return f.startsWith(mesFiltroBusqueda); 
    }
    return true;
  }).sort((a, b) => (new Date(parseFechaUniversal(b.fecha)).getTime() || 0) - (new Date(parseFechaUniversal(a.fecha)).getTime() || 0));

  const misClases = profesorSeleccionado ? clasesFirebase.filter(clase => clase.profesorId === profesorSeleccionado.id && !clase.archivada) : [];

  const handleEliminarAlumno = async (id) => {
    if(window.confirm('⚠️ ¿Borrar este alumno del directorio de forma permanente?')) {
      await deleteDoc(doc(db, "alumnos", id)); 
      setAlumnosFirebase(alumnosFirebase.filter(a => a.id !== id));
      setMensajeExito('Alumno eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  };

  const handleEliminarProfesor = async (id) => {
    if(window.confirm('⚠️ ¿Estás seguro de ELIMINAR PERMANENTEMENTE a este profesor?')) {
      await deleteDoc(doc(db, "profesores", id)); 
      setProfesores(profesores.filter(p => p.id !== id));
      setMensajeExito('Profesor eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  };

  const handleEliminarClase = async (id) => {
    const confirmacion = window.prompt('⚠️ PELIGRO: Para borrar esta clase y desconectar a sus alumnos, escribe la palabra ELIMINAR en mayúsculas:');
    if (confirmacion === 'ELIMINAR') {
      await deleteDoc(doc(db, "clases", id)); 
      setClasesFirebase(clasesFirebase.filter(c => c.id !== id));
      setMensajeExito('Clase eliminada permanentemente 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    } else if (confirmacion !== null) {
      triggerError('Palabra incorrecta. Operación cancelada por seguridad.');
    }
  };

  const handleEliminarPago = async (id) => {
    if(window.confirm('⚠️ ¿Borrar este registro de pago de forma permanente?')) {
      await deleteDoc(doc(db, "pagos", id)); 
      setPagosFirebase(pagosFirebase.filter(p => p.id !== id));
      setMensajeExito('Pago eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  };

  const handleEliminarMovimiento = async (id) => {
    if(window.confirm('⚠️ ¿Borrar este movimiento financiero de forma permanente?')) {
      await deleteDoc(doc(db, "movimientosExtra", id)); 
      setMovimientosExtra(movimientosExtra.filter(m => m.id !== id));
      setMensajeExito('Movimiento eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  };

  const handleEliminarRegistroClase = async (id) => {
    if(window.confirm('⚠️ ¿Borrar este registro histórico de clase? Esto recalculará los promedios y asistencias.')) {
      await deleteDoc(doc(db, "registrosClases", id)); 
      setRegistrosFirebase(registrosFirebase.filter(r => r.id !== id));
      setMensajeExito('Registro histórico eliminado 🗑️'); setTimeout(() => setMensajeExito(''), 3000);
    }
  };

  const handleToggleActivoAlumno = async (id, estadoActual) => {
    try {
      const alumRef = doc(db, "alumnos", id); 
      await updateDoc(alumRef, { activo: !estadoActual });
      setAlumnosFirebase(alumnosFirebase.map(a => a.id === id ? { ...a, activo: !estadoActual } : a));
      setMensajeExito(!estadoActual ? '¡Alumno reactivado! 🔓' : 'Alumno dado de baja 🔒'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { triggerError('Error de red. Intenta nuevamente.'); }
  };

  const handleToggleActivoProfesor = async (id, estadoActual) => {
    try {
      const profRef = doc(db, "profesores", id); 
      await updateDoc(profRef, { activo: !estadoActual });
      setProfesores(profesores.map(p => p.id === id ? { ...p, activo: !estadoActual } : p));
      setMensajeExito(!estadoActual ? '¡Profesor reactivado! 🔓' : 'Profesor archivado 🔒'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { triggerError('Error de conexión'); }
  };

  const handleToggleArchivarClase = async (id, estadoActual) => {
    try {
      const claseRef = doc(db, "clases", id); 
      await updateDoc(claseRef, { archivada: !estadoActual });
      setClasesFirebase(clasesFirebase.map(c => c.id === id ? { ...c, archivada: !estadoActual } : c));
      setMensajeExito(estadoActual ? 'Clase reactivada 📖' : 'Clase archivada 🗂️'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { triggerError('Error de conexión'); }
  };

  const handleAgregarAlumno = async (e) => {
    e.preventDefault();
    if (!nuevoAlumnoNombre || !nuevoAlumnoNumDoc) { triggerError('Nombre y documento son obligatorios'); return; }
    const existeDoc = alumnosFirebase.some(a => a.numDoc === nuevoAlumnoNumDoc);
    if (existeDoc) { triggerError('Ese documento ya está registrado. Usa otro.'); return; }
    
    const nombreLimpio = formatearNombre(nuevoAlumnoNombre); 

    try {
      await addDoc(collection(db, "alumnos"), { nombre: nombreLimpio, tipoDoc: nuevoAlumnoTipoDoc, numDoc: nuevoAlumnoNumDoc, email: nuevoAlumnoEmail || '', fechaRegistro: new Date().toISOString(), activo: true });
      setNuevoAlumnoNombre(''); setNuevoAlumnoNumDoc(''); setNuevoAlumnoEmail(''); 
      setMensajeExito('Alumno registrado en el Directorio ✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { triggerError('Error al guardar en base de datos'); }
  };

  const handleAgregarProfesor = async (e) => {
    e.preventDefault(); if (nombreNuevoProfesor.trim() === '') return;
    const colores = ['#4285F4', '#EA4335', '#34A853', '#FBBC05', '#8E24AA', '#F538A0', '#00ACC1', '#FF7043'];
    try {
      await addDoc(collection(db, "profesores"), { nombre: nombreNuevoProfesor, color: colores[Math.floor(Math.random() * colores.length)], activo: true });
      setNombreNuevoProfesor(''); setMensajeExito('Profesor registrado ✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { triggerError('Error de conexión'); }
  };

  const handleAgregarClase = async (e) => {
    e.preventDefault();
    if (!nuevaClaseTitulo || !nuevaClaseCurso || !nuevaClaseTarifa || estudiantesSeleccionados.length === 0 || !nuevaClaseProfesorId || !nuevaClaseDias || !nuevaClaseHorario) {
      triggerError('Completa todos los campos y selecciona al menos 1 alumno'); return;
    }
    try {
      if (editandoClaseId) {
        await updateDoc(doc(db, "clases", editandoClaseId), { titulo: nuevaClaseTitulo, curso: nuevaClaseCurso, tarifa: Number(nuevaClaseTarifa), dias: nuevaClaseDias, horario: nuevaClaseHorario, estudiantes: estudiantesSeleccionados, profesorId: nuevaClaseProfesorId });
        setMensajeExito('Clase actualizada correctamente ✏️✅');
      } else {
        await addDoc(collection(db, "clases"), { titulo: nuevaClaseTitulo, curso: nuevaClaseCurso, tarifa: Number(nuevaClaseTarifa), dias: nuevaClaseDias, horario: nuevaClaseHorario, estudiantes: estudiantesSeleccionados, profesorId: nuevaClaseProfesorId, archivada: false });
        setMensajeExito('Clase creada con éxito ✅');
      }
      setNuevaClaseTitulo(''); setNuevaClaseCurso(''); setNuevaClaseTarifa(''); setNuevaClaseDias(''); setNuevaClaseHorario(''); setEstudiantesSeleccionados([]); setNuevaClaseProfesorId(''); setBusquedaEstudiantesClase(''); setEditandoClaseId(null);
      setTimeout(() => setMensajeExito(''), 3000);
      const clasesSnap = await getDocs(collection(db, "clases")); setClasesFirebase(clasesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) { triggerError('Error de conexión'); }
  };

  const handleAgregarPago = async (e) => {
    e.preventDefault();
    if (!nuevoPagoAlumno || !nuevoPagoMonto || !nuevoPagoMes) { triggerError('Selecciona alumno, monto y mes'); return; }
    try {
      await addDoc(collection(db, "pagos"), { alumno: nuevoPagoAlumno, monto: Number(nuevoPagoMonto), mes: nuevoPagoMes, fechaRegistro: new Date().toISOString() });
      setNuevoPagoAlumno(''); setNuevoPagoMonto(''); setMensajeExito('Pago registrado 💰✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { triggerError('Error de conexión'); }
  };

  const handleAgregarMovimientoExtra = async (e) => {
    e.preventDefault();
    if (!conceptoMovimiento || !montoMovimiento || !mesMovimiento) { triggerError('Llenar concepto, monto y mes'); return; }
    try {
      await addDoc(collection(db, "movimientosExtra"), { tipo: tipoMovimiento, concepto: conceptoMovimiento, monto: Number(montoMovimiento), mes: mesMovimiento, fechaRegistro: new Date().toISOString() });
      setConceptoMovimiento(''); setMontoMovimiento(''); setMensajeExito('Movimiento guardado 📊✅'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { triggerError('Error de conexión'); }
  };

  const handleActualizarCurso = async () => {
    if (nuevoNombreCurso.trim() === '') return;
    try {
      const claseRef = doc(db, "clases", claseSeleccionada.id); await updateDoc(claseRef, { curso: nuevoNombreCurso });
      setClasesFirebase(clasesFirebase.map(c => c.id === claseSeleccionada.id ? { ...c, curso: nuevoNombreCurso } : c));
      setClaseSeleccionada({ ...claseSeleccionada, curso: nuevoNombreCurso }); setEditandoCurso(false); setMensajeExito('¡Nivel actualizado! 🚀'); setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) { triggerError('Error de conexión'); }
  };

  const handleLoginGlobal = (e) => {
    e.preventDefault(); 
    if (usuarioGlobal === 'bosslanguagecenter' && claveGlobal === 'cambiandovidas') { 
      setAccesoGlobal(true); setErrorLoginGlobal(false); 
    } else { 
      setErrorLoginGlobal(true); setTimeout(() => setErrorLoginGlobal(false), 3000); 
    }
  };

  const handleLoginProfesor = (e) => {
    e.preventDefault(); 
    const nombreProf = String(profesorAAutenticar?.nombre || '');
    const partesNombre = nombreProf.split(' '); 
    const iniciales = ((partesNombre[0]?.charAt(0) || '') + (partesNombre[1]?.charAt(0) || '')).toUpperCase(); 
    const pinCorrecto = `${iniciales}2026`;
    
    if (pinInput.toUpperCase() === pinCorrecto) { 
      setProfesorSeleccionado(profesorAAutenticar); setProfesorAAutenticar(null); setPinInput(''); setErrorPin(false); 
    } else { 
      setErrorPin(true); setTimeout(() => setErrorPin(false), 3000); 
    }
  };

  const handleLoginAdmin = (e) => {
    e.preventDefault(); 
    if(claveAdminInput === 'bossadmin2026') { 
      setVistaAdmin(true); setMostrarModalAdmin(false); setClaveAdminInput(''); setErrorAdminPin(false); 
    } else { 
      setErrorAdminPin(true); setTimeout(() => setErrorAdminPin(false), 3000); 
    }
  };

  const handleLoginAlumno = (e) => {
    e.preventDefault();
    const alumnoEncontrado = alumnosFirebase.find(a => String(a.tipoDoc) === String(loginAlumnoTipoDoc) && String(a.numDoc) === String(loginAlumnoNumDoc));
    if(alumnoEncontrado) {
      if (alumnoEncontrado.activo === false) { triggerError("Tu usuario ha sido dado de baja. Comunícate con administración."); return; }
      setAlumnoSeleccionado(alumnoEncontrado.nombre); setModoIngreso('inicio'); setLoginAlumnoNumDoc(''); setErrorLoginAlumno(false);
    } else { 
      setErrorLoginAlumno(true); setTimeout(() => setErrorLoginAlumno(false), 3000); 
    }
  };

  const handleCerrarSesionProfesor = () => { 
    setProfesorSeleccionado(null); setClaseSeleccionada(null); setEditandoRegistroId(null); 
  };

  const handleGuardarRegistro = async () => {
    let formularioCompleto = true;
    if (fechaClase.trim() === '' || horasClase.trim() === '') formularioCompleto = false;
    (claseSeleccionada.estudiantes || []).forEach(estudiante => { 
      const ast = asistencia[estudiante]; if (!ast) formularioCompleto = false;
      if (ast === 'asistio' || ast === 'reprogramo') {
        const n = notas[estudiante]; if (!n || (!n.oral && !n.grammar && !n.reading && !n.listening && !n.writing)) { formularioCompleto = false; }
      }
    });
    if (formularioCompleto) {
      try {
        if (editandoRegistroId) {
          await updateDoc(doc(db, "registrosClases", editandoRegistroId), {
            fecha: fechaClase, horas: Number(horasClase), tarifa: claseSeleccionada.tarifa, asistencia: asistencia, notas: notas, observacionesIndividuales: obsIndividual, observacionGeneral: obsGeneral
          });
          setMensajeExito('¡Registro actualizado exitosamente! ✏️✅');
          setEditandoRegistroId(null);
        } else {
          await addDoc(collection(db, "registrosClases"), {
            profesor: profesorSeleccionado?.nombre || 'Docente', clase: claseSeleccionada.titulo, nivel: claseSeleccionada.curso,
            fecha: fechaClase, horas: Number(horasClase), tarifa: claseSeleccionada.tarifa, asistencia: asistencia, notas: notas, observacionesIndividuales: obsIndividual, observacionGeneral: obsGeneral, fechaRegistro: new Date().toISOString()
          });
          setMensajeExito('¡Registro guardado exitosamente! ☁️✅');
        }
        setTimeout(() => setMensajeExito(''), 4000);
        setAsistencia({}); setNotas({}); setObsIndividual({}); setFechaClase(''); setHorasClase(''); setObsGeneral('');
        const regSnap = await getDocs(collection(db, "registrosClases")); setRegistrosFirebase(regSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) { triggerError('Error al guardar datos. Revisa tu conexión.'); }
    } else { triggerError('Faltan datos por llenar (Fecha, horas o notas).'); }
  };

  const obtenerEstiloBoton = (estudiante, estado, colorBorde, colorFondo, colorTexto) => {
    const estadoActual = asistencia[estudiante]; const algunSeleccionado = estadoActual !== undefined; const estaSeleccionado = estadoActual === estado; const mostrarColor = !algunSeleccionado || estaSeleccionado;
    return { padding: '8px 12px', borderRadius: '6px', border: `1px solid ${mostrarColor ? colorBorde : '#e5e7eb'}`, backgroundColor: mostrarColor ? colorFondo : '#f9fafb', color: mostrarColor ? colorTexto : '#9ca3af', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s ease', transform: estaSeleccionado ? 'scale(1.05)' : 'scale(1)', boxShadow: estaSeleccionado ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', opacity: (!estaSeleccionado && algunSeleccionado) ? 0.5 : 1 }
  };
  // ==========================================
  // ESTILOS GLOBALES Y MODO RESPONSIVO
  // ==========================================
  const estilosGlobales = (
    <style>{`
      body { margin: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #e5e7eb; position: relative; }
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
      
      @keyframes aparecerFade { from { opacity: 0; transform: scale(0.95) translate(-50%, -50%); } to { opacity: 1; transform: scale(1) translate(-50%, -50%); } }
      @keyframes vibrar { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      
      .scroll-casillas::-webkit-scrollbar { width: 6px; }
      .scroll-casillas::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
      .scroll-casillas::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      .scroll-casillas::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      .big-btn-home { padding: 20px 30px; border-radius: 16px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: all 0.3s ease; border: none; width: 250px; }
      .big-btn-home:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      
      .dashboard-layout { display: flex; height: 100vh; overflow: hidden; background-color: #f4f6f8; }
      .sidebar { width: 280px; background-color: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; }
      .sidebar-prof { width: 300px; background-color: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; }
      .sidebar-menu { padding: 20px 16px; flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
      .main-content { flex: 1; padding: 40px; overflow-y: auto; }
      .admin-menu-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600; text-align: left; transition: all 0.2s ease; margin-bottom: 8px; }
      .admin-menu-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .admin-menu-btn.active { background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
      .admin-menu-btn.inactive { background-color: #ffffff; border: 1px solid #e5e7eb; color: #4b5563; }
      .grid-resp-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

      @media (max-width: 768px) {
        .dashboard-layout { flex-direction: column; }
        .sidebar, .sidebar-prof { width: 100% !important; height: auto !important; border-right: none !important; border-bottom: 1px solid #e5e7eb; }
        .sidebar-menu { flex-direction: row !important; overflow-x: auto; padding: 10px !important; }
        .admin-menu-btn { margin-bottom: 0 !important; margin-right: 8px !important; white-space: nowrap; flex-shrink: 0; }
        .main-content { padding: 15px !important; }
        .grid-resp-2 { grid-template-columns: 1fr !important; }
        .big-btn-home { width: 100%; max-width: 300px; margin-bottom: 15px; }
        .login-card { margin: 0 15px; width: calc(100% - 30px); }
        .mobile-stack { flex-direction: column !important; align-items: stretch !important; }
        .mobile-stack > * { width: 100% !important; margin-bottom: 10px; }
      }
    `}</style>
  );

  // ==========================================
  // PANTALLA 1: INICIO (HOME)
  // ==========================================
  if (modoIngreso === 'inicio' && !alumnoSeleccionado && !accesoGlobal) {
    return (
      <div className="login-container" style={{ flexDirection: 'column' }}>
        {estilosGlobales}
        <img 
          src="/boss_accredible.png" 
          alt="Logo" 
          style={{ height: '90px', marginBottom: '40px' }} 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} 
        />
        <h1 style={{ color: '#1f2937', marginBottom: '40px', fontSize: '28px', textAlign: 'center', padding: '0 20px' }}>Bienvenido a Boss Language Center</h1>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
          <button onClick={() => setModoIngreso('alumno')} className="big-btn-home" style={{ backgroundColor: '#059669', color: 'white', boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)' }}>
            <span style={{ fontSize: '40px' }}>🎓</span> Portal Estudiantes <span style={{ fontSize: '13px', fontWeight: 'normal', opacity: 0.9 }}>Ver notas y asistencias</span>
          </button>
          <button onClick={() => setModoIngreso('staff')} className="big-btn-home" style={{ backgroundColor: '#1f2937', color: 'white', boxShadow: '0 4px 15px rgba(31, 41, 55, 0.3)' }}>
            <span style={{ fontSize: '40px' }}>💼</span> Acceso Docentes / Staff <span style={{ fontSize: '13px', fontWeight: 'normal', opacity: 0.9 }}>Gestión académica interna</span>
          </button>
        </div>
        
        <div style={{ position: 'absolute', bottom: '20px', color: '#9ca3af', fontSize: '13px', fontWeight: '500', letterSpacing: '0.5px' }}>
           Versión 3.0: First Class & Crispy Edition 🌟🍗
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 2: LOGIN ALUMNO
  // ==========================================
  if (modoIngreso === 'alumno' && !alumnoSeleccionado) {
    return (
      <div className="login-container" style={{ flexDirection: 'column' }}>
        {estilosGlobales}
        {mostrarError && (
          <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '12px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <strong>⚠️ Error: </strong>{mensajeError}
          </div>
        )}
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
            {errorLoginAlumno && <p style={{ color: '#ef4444', fontSize: '12px', margin: '-10px 0 15px 0' }}>Documento no encontrado o inactivo.</p>}
            <button type="submit" className="login-btn" style={{ backgroundColor: '#059669' }}>Acceder a mis Notas</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 3: PORTAL DEL ALUMNO (DASHBOARD)
  // ==========================================
  if (alumnoSeleccionado) {
    const registrosAlumnoRaw = registrosFirebase.filter(reg => reg.asistencia && reg.asistencia[alumnoSeleccionado]);
    const pagosAlumnoRaw = pagosFirebase.filter(p => p.alumno === alumnoSeleccionado).sort((a,b) => (new Date(parseFechaUniversal(b.fechaRegistro)).getTime()||0) - (new Date(parseFechaUniversal(a.fechaRegistro)).getTime()||0));

    const registrosAlumno = registrosAlumnoRaw.filter(r => {
        if(mesFiltroAlumno === 'todo') return true;
        const f = parseFechaUniversal(r.fecha);
        if (['2026', '2025', '2024'].includes(mesFiltroAlumno)) return f.startsWith(mesFiltroAlumno);
        return f.startsWith(mesFiltroAlumno);
    });
    
    const pagosAlumno = pagosAlumnoRaw.filter(p => mesFiltroAlumno === 'todo' || (['2026', '2025', '2024'].includes(mesFiltroAlumno) ? String(p.mes||'').startsWith(mesFiltroAlumno) : p.mes === mesFiltroAlumno));

    let totalAsistencias = 0; let totalFaltas = 0; let notasList = [];
    let sumas = { oral: 0, grammar: 0, reading: 0, listening: 0, writing: 0 };
    let counts = { oral: 0, grammar: 0, reading: 0, listening: 0, writing: 0 };

    registrosAlumno.forEach(reg => {
       const estado = reg.asistencia[alumnoSeleccionado];
       if(estado === 'asistio' || estado === 'reprogramo') {
           totalAsistencias++;
           const notaObj = reg.notas && reg.notas[alumnoSeleccionado];
           
           if(typeof notaObj === 'object' && notaObj !== null) {
              if(notaObj.oral) { sumas.oral += Number(notaObj.oral); counts.oral++; }
              if(notaObj.grammar) { sumas.grammar += Number(notaObj.grammar); counts.grammar++; }
              if(notaObj.reading) { sumas.reading += Number(notaObj.reading); counts.reading++; }
              if(notaObj.listening) { sumas.listening += Number(notaObj.listening); counts.listening++; }
              if(notaObj.writing) { sumas.writing += Number(notaObj.writing); counts.writing++; }
           }
           
           const val = typeof notaObj === 'object' ? getPromedio(notaObj) : parseFloat(notaObj);
           if(!isNaN(val)) notasList.push(parseFloat(val));
       } else if (estado === 'no-asistio') { totalFaltas++; }
    });

    const dataRadar = [
      { skill: '🗣️ Oral', A: counts.oral > 0 ? parseFloat((sumas.oral/counts.oral).toFixed(1)) : 0, fullMark: 20 },
      { skill: '✍️ Grammar', A: counts.grammar > 0 ? parseFloat((sumas.grammar/counts.grammar).toFixed(1)) : 0, fullMark: 20 },
      { skill: '📖 Reading', A: counts.reading > 0 ? parseFloat((sumas.reading/counts.reading).toFixed(1)) : 0, fullMark: 20 },
      { skill: '🎧 Listening', A: counts.listening > 0 ? parseFloat((sumas.listening/counts.listening).toFixed(1)) : 0, fullMark: 20 },
      { skill: '📝 Writing', A: counts.writing > 0 ? parseFloat((sumas.writing/counts.writing).toFixed(1)) : 0, fullMark: 20 },
    ];

    const asistenciaPorcentaje = totalAsistencias + totalFaltas > 0 ? Math.round((totalAsistencias / (totalAsistencias + totalFaltas))*100) : 0;
    const promedioGlobal = notasList.length > 0 ? (notasList.reduce((a,b)=>a+b,0)/notasList.length).toFixed(1) : '--';
    
    const mesReferencia = (mesFiltroAlumno === 'todo' || ['2026', '2025', '2024'].includes(mesFiltroAlumno)) ? new Date().toISOString().substring(0, 7) : mesFiltroAlumno; 
    const pagoAlDia = pagosFirebase.some(p => p.alumno === alumnoSeleccionado && p.mes === mesReferencia);

    return (
      <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {estilosGlobales}
        {mensajeExito && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>☁️</span><div><h4 style={{ margin: 0 }}>{mensajeExito}</h4></div></div>)}

        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.4s ease' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src="/boss_accredible.png" alt="Logo" style={{ height: '50px' }} />
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#111827', textTransform: 'capitalize' }}>Hola, {String(alumnoSeleccionado)}</h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Portal Académico y Financiero</p>
              </div>
            </div>
            <button onClick={() => {setAlumnoSeleccionado(null); setModoIngreso('inicio')}} className="btn-flotante" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Sesión</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span style={{ fontWeight: '600', color: '#374151' }}>📅 Periodo Académico:</span>
               <select value={mesFiltroAlumno} onChange={(e) => setMesFiltroAlumno(e.target.value)} className="input-flotante" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <option value="todo">Historial Completo</option>
                  <option value="2026">Todo el 2026 (Anual)</option>
                  <option value="2025">Todo el 2025 (Anual)</option>
                  <option value="2024">Todo el 2024 (Anual)</option>
                  <optgroup label="Meses Específicos">
                    {opcionesMesesGlobal.map(m => <option key={m} value={m}>{formatMesTexto(m)}</option>)}
                  </optgroup>
               </select>
            </div>
            <button onClick={generarPDFReporteAlumnoUnico} className="btn-flotante" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>
              📄 Descargar Libreta
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

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', textAlign: 'center' }}>🕸️ Análisis de Habilidades (Skills)</h2>
            {counts.oral === 0 && counts.reading === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', margin: '20px 0' }}>El gráfico aparecerá cuando tengas notas detalladas en este periodo.</p>
            ) : (
              <div style={{ width: '100%', height: '350px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#374151', fontSize: 13, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Radar name="Mi Promedio" dataKey="A" stroke="#2563eb" strokeWidth={2} fill="#3b82f6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>📚 Mi Historial de Clases</h2>
              <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                      <th style={{ padding: '12px' }}>Fecha</th>
                      <th style={{ padding: '12px' }}>Asistencia</th>
                      <th style={{ padding: '12px' }}>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosAlumno.sort((a,b) => (new Date(parseFechaUniversal(b.fecha)).getTime()||0) - (new Date(parseFechaUniversal(a.fecha)).getTime()||0)).map((reg, idx) => {
                      const estado = reg.asistencia[alumnoSeleccionado];
                      const colorEstado = estado === 'asistio' ? '#10b981' : estado === 'no-asistio' ? '#ef4444' : '#f59e0b';
                      const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alumnoSeleccionado]) : '--';
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontWeight: '500', minWidth: '90px' }}>{reg.fecha}</td>
                          <td style={{ padding: '12px', color: colorEstado, fontWeight: '600', textTransform: 'capitalize', minWidth: '90px' }}>{String(estado||'--').replace('-', ' ')}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{notaCol}</td>
                        </tr>
                      )
                    })}
                    {registrosAlumno.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No hay clases registradas en este periodo.</td></tr>}
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
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{pago.fechaRegistro ? new Date(pago.fechaRegistro).toLocaleDateString() : '--'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>S/. {Number(pago.monto || 0).toFixed(2)}</span>
                      <button onClick={() => generarPDFRecibo(pago)} className="btn-flotante" style={{ background: '#3b82f6', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: 'white', fontWeight: 'bold' }}>
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
                {pagosAlumno.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>No tienes pagos registrados en este periodo.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 4: LOGIN DOCENTE / STAFF
  // ==========================================
  if (modoIngreso === 'staff' && !accesoGlobal) {
    return (
      <div className="login-container" style={{ flexDirection: 'column' }}>
        {estilosGlobales}
        {mostrarError && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '12px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}><strong>⚠️ Error: </strong>{mensajeError}</div>)}
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
    );
  }

  // ==========================================
  // PANTALLA 5: DASHBOARD DE ADMINISTRACIÓN
  // ==========================================
  if (vistaAdmin) {
    const { enRiesgo, cuadroHonor } = calcularMetricas();
    const finanzas = calcularFinanzas();

    return (
      <>
        {estilosGlobales}
        {mostrarError && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>⚠️</span><div><h4 style={{ margin: 0 }}>{mensajeError || 'Faltan datos por llenar'}</h4></div></div>)}
        {mensajeExito && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>☁️</span><div><h4 style={{ margin: 0 }}>{mensajeExito}</h4></div></div>)}

        <div className="dashboard-layout">
          
          <div className="sidebar">
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
              <img src="/boss_accredible.png" alt="Logo" style={{ height: '40px', marginBottom: '10px' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
              <h1 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Admin Panel</h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Centro de Operaciones</p>
            </div>
            
            <div className="sidebar-menu">
              <button className={`admin-menu-btn ${adminTab === 'reportes' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('reportes')}><span style={{ fontSize: '18px' }}>📈</span> Reportes Alumnos</button>
              <button className={`admin-menu-btn ${adminTab === 'directorio_alumnos' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('directorio_alumnos')}><span style={{ fontSize: '18px' }}>👥</span> Directorio Alumnos</button>
              <button className={`admin-menu-btn ${adminTab === 'rendimiento' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('rendimiento')}><span style={{ fontSize: '18px' }}>👨‍🏫</span> Rendimiento Docente</button>
              <button className={`admin-menu-btn ${adminTab === 'finanzas' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('finanzas')}><span style={{ fontSize: '18px' }}>💰</span> Finanzas y Pagos</button>
              <button className={`admin-menu-btn ${adminTab === 'clases' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('clases')}><span style={{ fontSize: '18px' }}>📚</span> Gestión de Clases</button>
              <button className={`admin-menu-btn ${adminTab === 'profesores' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('profesores')}><span style={{ fontSize: '18px' }}>👔</span> Directorio Profesores</button>
              
              <div style={{ margin: '15px 0', borderTop: '1px solid #e5e7eb' }}></div>
              
              <button className={`admin-menu-btn ${adminTab === 'migracion' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('migracion')} style={{ borderStyle: 'dashed', borderColor: adminTab === 'migracion' ? '#3b82f6' : '#cbd5e1', color: '#2563eb' }}>
                <span style={{ fontSize: '18px' }}>🔄</span> Importar Historial
              </button>
              <button className={`admin-menu-btn ${adminTab === 'backup' ? 'active' : 'inactive'}`} onClick={() => setAdminTab('backup')} style={{ marginTop: '8px', borderStyle: 'dashed', borderColor: adminTab === 'backup' ? '#fca5a5' : '#cbd5e1', color: '#e11d48' }}>
                <span style={{ fontSize: '18px' }}>💽</span> Backup Nuclear
              </button>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setVistaAdmin(false)} className="btn-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#4b5563', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                🚪 Salir del Admin
              </button>
            </div>
          </div>

          <div className="main-content">
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

              {/* MÁQUINA DEL TIEMPO (IMPORTADOR) */}
              {adminTab === 'migracion' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '10px' }}>🔄 Máquina del Tiempo (Importador)</h2>
                    <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                      Copia las celdas directamente de tu Excel antiguo y pégalas aquí. <br/>
                      <strong>Formato requerido:</strong> Fecha | Oral | Grammar | Reading | Listening | Writing
                    </p>

                    <form onSubmit={handleProcesarImportacion} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="grid-resp-2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div>
                          <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600', marginBottom: '6px', display: 'block' }}>1. Selecciona la Clase</label>
                          <select value={claseImportar} onChange={(e) => setClaseImportar(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb' }}>
                            <option value="">-- Buscar Grupo --</option>
                            {clasesFirebase.map(c => <option key={c.id} value={c.id}>{c.titulo} ({c.curso})</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600', marginBottom: '6px', display: 'block' }}>2. Profesor a cargo</label>
                          <select value={profesorImportar} onChange={(e) => setProfesorImportar(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb' }}>
                            <option value="">-- Buscar Docente --</option>
                            {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600', marginBottom: '6px', display: 'block' }}>3. Nombre del Alumno</label>
                          <input 
                            maxLength="60"
                            list="lista-alumnos-import" 
                            value={alumnoImportar} 
                            onChange={(e) => setAlumnoImportar(e.target.value)} 
                            className="input-flotante" 
                            placeholder="Ej: Ana Castillo" 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <datalist id="lista-alumnos-import">
                            {todosLosAlumnos.map((alum, idx) => <option key={idx} value={alum} />)}
                          </datalist>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#059669' }}>Si no existe, se creará automáticamente.</p>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600', marginBottom: '6px', display: 'block' }}>4. Pega los datos de Excel aquí:</label>
                        <textarea 
                          value={textoImportar} 
                          onChange={(e) => setTextoImportar(e.target.value)} 
                          className="input-flotante" 
                          rows="10" 
                          placeholder="2024-02-12&#9;12&#9;10&#9;13&#9;12&#9;12&#10;2024-02-15&#9;13&#9;11&#9;12&#9;12&#9;12" 
                          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px dashed #3b82f6', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace', backgroundColor: '#eff6ff' }}
                        ></textarea>
                      </div>

                      <button type="submit" disabled={procesandoImportacion} className="btn-flotante" style={{ padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: procesandoImportacion ? '#9ca3af' : '#2563eb', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: procesandoImportacion ? 'not-allowed' : 'pointer' }}>
                        {procesandoImportacion ? '⏳ Importando historial...' : '🚀 Procesar Importación Masiva'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* BACKUP NUCLEAR */}
              {adminTab === 'backup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ backgroundColor: 'white', padding: '40px 32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '600px', margin: '0 auto', width: '100%', borderTop: '5px solid #e11d48' }}>
                    <span style={{ fontSize: '50px', display: 'block', marginBottom: '15px' }}>💽</span>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#111827' }}>Respaldo Nuclear de Datos</h2>
                    <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '30px', lineHeight: '1.6' }}>
                      Esta herramienta te permite descargar una copia de seguridad encriptada (JSON) de absolutamente todo el sistema: alumnos, profesores, clases, historial de notas y finanzas. 
                      <br/><br/>
                      <strong>Guarda este archivo en un lugar seguro.</strong>
                    </p>
                    <button onClick={descargarRespaldoNuclear} className="btn-flotante" style={{ backgroundColor: '#e11d48', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '16px', boxShadow: '0 4px 15px rgba(225, 29, 72, 0.3)' }}>
                      ⬇️ Generar y Descargar Backup Total
                    </button>
                  </div>
                </div>
              )}

              {/* REPORTES */}
              {adminTab === 'reportes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>🔍 Buscador y Exportación</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                      <div className="mobile-stack" style={{ display: 'flex', gap: '10px', flex: '1 1 auto', flexWrap: 'wrap' }}>
                        <select value={tipoBusqueda} onChange={(e) => {setTipoBusqueda(e.target.value); setTerminoBusqueda('');}} className="input-flotante" style={{ width: '160px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>
                          <option value="alumno">👤 Alumno</option>
                          <option value="clase">📚 Grupo / Empresa</option>
                          <option value="profesor">👨‍🏫 Profesor</option>
                          <option value="fecha">📅 Fecha Exacta</option>
                        </select>
                        <input type="text" placeholder={tipoBusqueda === 'fecha' ? "Ej: 12/02 o 2024" : "Buscar..."} value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} className="input-flotante" style={{ flex: 1, minWidth: '200px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} />
                        <select value={mesFiltroBusqueda} onChange={(e) => setMesFiltroBusqueda(e.target.value)} className="input-flotante" style={{ width: '160px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}>
                          <option value="todo">Historial Completo</option>
                          <option value="2026">Todo el 2026 (Anual)</option>
                          <option value="2025">Todo el 2025 (Anual)</option>
                          <option value="2024">Todo el 2024 (Anual)</option>
                          <optgroup label="Meses Específicos">
                            {opcionesMesesGlobal.map(m => <option key={m} value={m}>{formatMesTexto(m)}</option>)}
                          </optgroup>
                        </select>
                      </div>
                      <div className="mobile-stack" style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => generarPDFAdmin(resultadosBusqueda)} className="btn-flotante" style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: '600', cursor: 'pointer' }}>📄 PDF</button>
                        <button onClick={() => generarExcelAdmin(resultadosBusqueda)} className="btn-flotante" style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer' }}>📊 EXCEL</button>
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      {String(terminoBusqueda).trim() === '' ? (
                        <div className="grid-resp-2" style={{ marginTop: '10px' }}>
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
                              <th style={{ padding: '12px' }}>Fecha</th><th style={{ padding: '12px' }}>Alumno</th><th style={{ padding: '12px' }}>Clase / Nivel</th><th style={{ padding: '12px' }}>Profesor</th><th style={{ padding: '12px' }}>Asistencia</th><th style={{ padding: '12px' }}>Nota</th><th style={{ padding: '12px' }}>Observaciones</th><th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultadosBusqueda.map((reg, idx) => {
                                const nombres = Object.keys(reg.asistencia || {});
                                let alumnosAMostrar = nombres;
                                if (tipoBusqueda === 'alumno') { 
                                  const match = nombres.find(n => String(n||'').toLowerCase().includes(String(terminoBusqueda).toLowerCase())); 
                                  if (match) alumnosAMostrar = [match]; 
                                }
                                const claseEnBD = clasesFirebase.find(c => c.titulo === reg.clase); 
                                const nivelReal = reg.nivel || (claseEnBD ? claseEnBD.curso : '--');
                                
                                return alumnosAMostrar.map((alum, subIdx) => {
                                  const estado = reg.asistencia?.[alum]; 
                                  const colorEstado = estado === 'asistio' ? '#10b981' : estado === 'no-asistio' ? '#ef4444' : '#f59e0b';
                                  const observacion = reg.observacionesIndividuales?.[alum] || reg.observacionGeneral || '--';
                                  const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alum]) : '--';
                                  
                                  return (
                                    <tr key={`${reg.id || idx}-${subIdx}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px', fontWeight: '500', color: '#111827' }}>{reg.fecha || '--'}</td>
                                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{alum || '--'}</td>
                                        <td style={{ padding: '12px' }}>{reg.clase || '--'} <br/><span style={{ color: '#6b7280', fontSize: '11px' }}>Nivel: {nivelReal}</span></td>
                                        <td style={{ padding: '12px' }}>{reg.profesor || '--'}</td>
                                        <td style={{ padding: '12px', color: colorEstado, fontWeight: '600', textTransform: 'capitalize' }}>{String(estado||'--').replace('-', ' ')}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{notaCol}</td>
                                        <td style={{ padding: '12px', color: '#4b5563', maxWidth: '200px' }}>{observacion}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                          <button onClick={() => {
                                             setProfesorSeleccionado(profesores.find(p => p.nombre === reg.profesor));
                                             setClaseSeleccionada(clasesFirebase.find(c => c.titulo === reg.clase));
                                             setFechaClase(reg.fecha || ''); setHorasClase(reg.horas || ''); setAsistencia(reg.asistencia || {}); setNotas(reg.notas || {}); setObsIndividual(reg.observacionesIndividuales || {}); setObsGeneral(reg.observacionGeneral || ''); setEditandoRegistroId(reg.id);
                                             window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '5px' }} title="Editar notas">✏️</button>
                                          <button onClick={() => handleEliminarRegistroClase(reg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Borrar registro completo de esta sesión">🗑️</button>
                                        </td>
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

              {/* DIRECTORIO ALUMNOS CON EDICION */}
              {adminTab === 'directorio_alumnos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div className="grid-resp-2">
                    
                    {/* COLUMNA IZQUIERDA: CREAR ALUMNO */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>➕ Registrar Nuevo Alumno</h2>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px' }}>Registrar aquí permite al alumno ingresar al portal usando su documento de identidad.</p>
                      <form onSubmit={handleAgregarAlumno} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Nombre Completo</label>
                          <input type="text" placeholder="Ej: Ana Perez" value={nuevoAlumnoNombre} onChange={(e) => setNuevoAlumnoNombre(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Tipo Doc.</label>
                            <select value={nuevoAlumnoTipoDoc} onChange={(e) => setNuevoAlumnoTipoDoc(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                              <option value="DNI">DNI</option>
                              <option value="CE">CE</option>
                              <option value="Pasaporte">Pasaporte</option>
                              <option value="RUC">RUC</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Número de Documento</label>
                            <input type="text" placeholder="Ej: 76543210" value={nuevoAlumnoNumDoc} onChange={(e) => setNuevoAlumnoNumDoc(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Correo Electrónico (Opcional)</label>
                          <input type="email" placeholder="Ej: ana@correo.com" value={nuevoAlumnoEmail} onChange={(e) => setNuevoAlumnoEmail(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" className="btn-flotante" style={{ padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: '600', cursor: 'pointer', marginTop: '5px' }}>Guardar en Directorio</button>
                      </form>
                    </div>

                    {/* COLUMNA DERECHA: DIRECTORIO CON EDICION */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h2 style={{ margin: 0, fontSize: '20px', color: '#374151' }}>👥 Alumnos en Directorio</h2>
                      </div>
                      <input type="text" placeholder="🔍 Buscar por nombre o número de documento..." value={busquedaDirectorio} onChange={(e) => setBusquedaDirectorio(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                        {alumnosFirebase.filter(a => safeIncludes(a.nombre, busquedaDirectorio) || safeIncludes(a.numDoc, busquedaDirectorio)).map(alum => (
                          
                          editandoAlumnoId === alum.id ? (
                            <div key={alum.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                              <p style={{margin: '0 0 5px 0', fontSize: '13px', color: '#b45309', fontWeight: 'bold'}}>✏️ Editando Perfil</p>
                              <input type="text" value={editAlumnoNombre} onChange={e=>setEditAlumnoNombre(e.target.value)} className="input-flotante" style={{padding:'10px', borderRadius:'6px', border:'1px solid #d1d5db', fontSize: '14px'}} placeholder="Nombre completo" />
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <select value={editAlumnoTipoDoc} onChange={e=>setEditAlumnoTipoDoc(e.target.value)} className="input-flotante" style={{padding:'10px', borderRadius:'6px', border:'1px solid #d1d5db', width:'30%', fontSize: '13px'}}>
                                   <option value="DNI">DNI</option><option value="CE">CE</option><option value="Pasaporte">Pasap.</option><option value="RUC">RUC</option><option value="Otro">Otro</option>
                                </select>
                                <input type="text" value={editAlumnoNumDoc} onChange={e=>setEditAlumnoNumDoc(e.target.value)} className="input-flotante" style={{padding:'10px', borderRadius:'6px', border:'1px solid #d1d5db', width:'70%', fontSize: '14px'}} placeholder="Documento" />
                              </div>
                              <input type="email" value={editAlumnoEmail} onChange={e=>setEditAlumnoEmail(e.target.value)} className="input-flotante" style={{padding:'10px', borderRadius:'6px', border:'1px solid #d1d5db', fontSize: '14px'}} placeholder="Correo electrónico (Opcional)" />
                              <div style={{display:'flex', gap:'10px', marginTop:'5px'}}>
                                <button onClick={() => handleActualizarAlumno(alum.id, alum.nombre)} style={{flex:1, background:'#10b981', color:'white', border:'none', padding:'10px', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>Guardar Cambios</button>
                                <button onClick={() => setEditandoAlumnoId(null)} style={{flex:1, background:'#ef4444', color:'white', border:'none', padding:'10px', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'}}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <div key={alum.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', opacity: alum.activo !== false ? 1 : 0.5 }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: alum.activo !== false ? '#374151' : '#9ca3af', textDecoration: alum.activo !== false ? 'none' : 'line-through', textTransform: 'capitalize' }}>{alum.nombre || 'Desconocido'}</span>
                                <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{alum.tipoDoc || 'DOC'}: <strong style={{color: alum.numDoc === 'PENDIENTE' ? '#ef4444' : 'inherit'}}>{alum.numDoc || '--'}</strong></span>
                                {alum.email && <span style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>📧 {alum.email}</span>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={() => {
                                  setEditandoAlumnoId(alum.id); setEditAlumnoNombre(alum.nombre); setEditAlumnoTipoDoc(alum.tipoDoc || 'DNI'); setEditAlumnoNumDoc(alum.numDoc); setEditAlumnoEmail(alum.email || '');
                                }} style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '14px' }} title="Editar Alumno">✏️</button>
                                
                                <button onClick={() => handleToggleActivoAlumno(alum.id, alum.activo !== false)} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: alum.activo !== false ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                                  {alum.activo !== false ? 'Dar de baja' : 'Reactivar'}
                                </button>
                                <button onClick={() => handleEliminarAlumno(alum.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Eliminar Permanente">🗑️</button>
                              </div>
                            </div>
                          )
                        ))}
                        {alumnosFirebase.filter(a => safeIncludes(a.nombre, busquedaDirectorio) || safeIncludes(a.numDoc, busquedaDirectorio)).length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>No hay resultados de búsqueda.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'rendimiento' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
                      <h2 style={{ margin: '0 0 20px', color: '#111827' }}>Dashboard Académico Docente</h2>
                      <select value={mesFiltroBusqueda} onChange={(e) => setMesFiltroBusqueda(e.target.value)} className="input-flotante" style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontSize: '13px' }}>
                        <option value="todo">Historial Completo</option>
                        <option value="2026">Todo el 2026 (Anual)</option>
                        <option value="2025">Todo el 2025 (Anual)</option>
                        <option value="2024">Todo el 2024 (Anual)</option>
                        <optgroup label="Meses Específicos">
                          {opcionesMesesGlobal.map(m => <option key={m} value={m}>{formatMesTexto(m)}</option>)}
                        </optgroup>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {calcularMetricasDocentes().map((metrica, idx) => (
                        <div key={idx} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar" style={{ backgroundColor: metrica.color, width: '36px', height: '36px', fontSize: '14px' }}>{getInitial(metrica.nombre)}</div>
                            <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{metrica.nombre || 'Docente'}</span>
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
                    </div>
                  </div>
                </div>
              )}

              {/* FINANZAS */}
              {adminTab === 'finanzas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: '0 0 20px', color: '#111827' }}>Dashboard Financiero e Ingresos</h2>
                    <select value={mesFinanzas} onChange={(e) => setMesFinanzas(e.target.value)} className="input-flotante" style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#f9fafb', fontSize: '13px', fontWeight: 'bold' }}>
                      <option value="todo">Historial Completo</option>
                      <option value="2026">Todo el 2026 (Anual)</option>
                      <option value="2025">Todo el 2025 (Anual)</option>
                      <option value="2024">Todo el 2024 (Anual)</option>
                      <optgroup label="Meses Específicos">
                        {opcionesMesesGlobal.map(m => <option key={m} value={m}>{formatMesTexto(m)}</option>)}
                      </optgroup>
                    </select>
                  </div>

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
                      <h3 style={{ margin: '0', fontSize: '24px', color: finanzas.balance >= 0 ? '#1d4ed8' : '#c2410c' }}>S/. {finanzas.balance.toFixed(2)}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>Resultado Operativo</p>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '15px', fontWeight: '700' }}>🏛️ Distribución de Utilidades y Fondos (Regla 20% Reserva / 40% - 40% Socios)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase' }}>Reserva Empresa (20%)</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>S/. {finanzas.reservaEmpresa.toFixed(2)}</div>
                      </div>
                      <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase' }}>Socio 1 - Daniel Velez (40%)</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>S/. {finanzas.repartoDaniel.toFixed(2)}</div>
                      </div>
                      <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase' }}>Socio 2 - Michael Montero (40%)</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginTop: '4px' }}>S/. {finanzas.repartoMichael.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {mesFinanzas !== 'todo' && !['2026', '2025', '2024'].includes(mesFinanzas) && (
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h3 style={{ margin: '0 0 15px 0', color: '#374151', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🚦 Estado de Cuenta de Alumnos ({mesFinanzas})</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {alumnosActivos.map(alum => {
                          const haPagado = pagosFirebase.some(p => p.alumno === alum && p.mes === mesFinanzas);
                          return (
                            <div key={alum} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${haPagado ? '#bbf7d0' : '#fecdd3'}`, backgroundColor: haPagado ? '#f0fdf4' : '#fff1f2' }}>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151', textTransform: 'capitalize' }}>{alum}</span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: haPagado ? '#166534' : '#9f1239' }}>{haPagado ? '🟢 Al día' : '🔴 Debe'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid-resp-2">
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>🎓 Registrar Mensualidad de Alumno</h2>
                      <form onSubmit={handleAgregarPago} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Alumno</label>
                          <select value={nuevoPagoAlumno} onChange={(e) => setNuevoPagoAlumno(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                            <option value="">-- Seleccionar --</option>
                            {alumnosActivos.map((alum, idx) => (<option key={idx} value={alum}>{alum}</option>))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Monto (S/.)</label>
                          <input type="number" placeholder="Ej: 150" value={nuevoPagoMonto} onChange={(e) => setNuevoPagoMonto(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Mes</label>
                          <select value={nuevoPagoMes} onChange={(e) => setNuevoPagoMes(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                            {opcionesMesesGlobal.map(m => <option key={m} value={m}>{formatMesTexto(m)}</option>)}
                          </select>
                        </div>
                        <button type="submit" className="btn-flotante" style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Guardar Mensualidad</button>
                      </form>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>📦 Registrar Movimiento Extra</h2>
                      <form onSubmit={handleAgregarMovimientoExtra} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Tipo de Operación</label>
                          <select value={tipoMovimiento} onChange={(e) => {setTipoMovimiento(e.target.value); setConceptoMovimiento('');}} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                            <option value="ingreso_extra">🟩 Ingreso Extra</option>
                            <option value="gasto_extra">🟥 Gasto Extra Operativo</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Concepto</label>
                          {tipoMovimiento === 'gasto_extra' ? (
                            <select value={conceptoMovimiento} onChange={(e) => setConceptoMovimiento(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                              <option value="">-- Selecciona Categoría --</option>
                              <option value="Redes sociales">Redes sociales</option>
                              <option value="Hosting">Hosting</option>
                              <option value="Dominio .com">Dominio .com</option>
                              <option value="Dominio .edu.pe">Dominio .edu.pe</option>
                              <option value="Contador">Contador</option>
                              <option value="Otros Gastos">Otros</option>
                            </select>
                          ) : (
                            <input type="text" placeholder="Ej: Devolución SUNAT" value={conceptoMovimiento} onChange={(e) => setConceptoMovimiento(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Monto (S/.)</label>
                            <input type="number" placeholder="Ej: 200" value={montoMovimiento} onChange={(e) => setMontoMovimiento(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Mes</label>
                            <select value={mesMovimiento} onChange={(e) => setMesMovimiento(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}>
                              {opcionesMesesGlobal.map(m => <option key={m} value={m}>{formatMesTexto(m)}</option>)}
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="btn-flotante" style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Guardar Movimiento</button>
                      </form>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>📄 Historial de Mensualidades</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                        {pagosFirebase.filter(p => matchFiltroFinanzas(p.mes)).sort((a,b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)).map((pago, idx) => (
                          <div key={pago.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '15px', fontWeight: '600', color: '#374151', textTransform: 'capitalize' }}>{pago.alumno || '--'}</span>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Reg: {pago.fechaRegistro ? new Date(pago.fechaRegistro).toLocaleDateString() : '--'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>+ S/. {Number(pago.monto || 0).toFixed(2)}</span>
                                <span style={{ fontSize: '11px', color: '#6b7280' }}>Mes: {pago.mes || '--'}</span>
                              </div>
                              <button onClick={() => generarPDFRecibo(pago)} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '16px' }} title="Descargar Boleta PDF">📄</button>
                              <button onClick={() => handleEliminarPago(pago.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Eliminar Permanente">🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>📦 Movimientos Extra</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                        {movimientosExtra.filter(m => matchFiltroFinanzas(m.mes)).sort((a,b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)).map((mov, idx) => (
                          <div key={mov.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${mov.tipo === 'ingreso_extra' ? '#bbf7d0' : '#fecdd3'}` }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '15px', fontWeight: '600', color: '#374151', textTransform: 'capitalize' }}>{mov.concepto || '--'}</span>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{mov.fechaRegistro ? new Date(mov.fechaRegistro).toLocaleDateString() : '--'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '16px', fontWeight: 'bold', color: mov.tipo === 'ingreso_extra' ? '#059669' : '#e11d48' }}>
                                  {mov.tipo === 'ingreso_extra' ? '+' : '-'} S/. {Number(mov.monto || 0).toFixed(2)}
                              </span>
                              <button onClick={() => handleEliminarMovimiento(mov.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Eliminar">🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CLASES CON BUSCADOR IN-LINE */}
              {adminTab === 'clases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {editandoClaseId ? '✏️ Editando Clase' : '➕ Crear Nuevo Grupo o Clase'}
                    </h2>
                    <form onSubmit={handleAgregarClase} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className="mobile-stack" style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Nombre identificador</label>
                          <input type="text" placeholder="Ej: Grupo Ana" value={nuevaClaseTitulo} onChange={(e) => setNuevaClaseTitulo(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Nivel / Programa</label>
                          <input type="text" placeholder="Ej: Preparación B2" value={nuevaClaseCurso} onChange={(e) => setNuevaClaseCurso(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div className="mobile-stack" style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Días de clase</label>
                          <input type="text" placeholder="Ej: Lunes y Miércoles" value={nuevaClaseDias} onChange={(e) => setNuevaClaseDias(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Horario regular</label>
                          <input type="text" placeholder="Ej: 20:00 - 21:30" value={nuevaClaseHorario} onChange={(e) => setNuevaClaseHorario(e.target.value)} className="input-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div className="mobile-stack" style={{ display: 'flex', gap: '15px' }}>
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
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Seleccionar Estudiantes (Pre-registrados en el Directorio)</label>
                        <input 
                          type="text" 
                          placeholder="🔍 Buscar estudiante por nombre o documento..." 
                          value={busquedaEstudiantesClase} 
                          onChange={(e) => setBusquedaEstudiantesClase(e.target.value)} 
                          className="input-flotante" 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', marginBottom: '10px', boxSizing: 'border-box', fontSize: '13px' }} 
                        />
                        <div className="scroll-casillas" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', backgroundColor: '#f9fafb' }}>
                          {alumnosFirebase.filter(al => al.activo !== false && (safeIncludes(al.nombre, busquedaEstudiantesClase) || safeIncludes(al.numDoc, busquedaEstudiantesClase))).length === 0 ? (
                            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>⚠️ No hay alumnos que coincidan con la búsqueda.</p>
                          ) : (
                            alumnosFirebase.filter(al => al.activo !== false && (safeIncludes(al.nombre, busquedaEstudiantesClase) || safeIncludes(al.numDoc, busquedaEstudiantesClase))).map(al => (
                              <label key={al.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}>
                                <input type="checkbox" checked={estudiantesSeleccionados.includes(al.nombre)} onChange={(e) => { if(e.target.checked) setEstudiantesSeleccionados([...estudiantesSeleccionados, al.nombre]); else setEstudiantesSeleccionados(estudiantesSeleccionados.filter(n => n !== al.nombre)); }} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                                <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
                                  {al.nombre} <span style={{color: '#9ca3af', fontSize: '12px', marginLeft: '5px'}}>{al.numDoc ? `(${al.numDoc})` : ''}</span>
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <div className="mobile-stack" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="btn-flotante" style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: editandoClaseId ? '#10b981' : '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                          {editandoClaseId ? 'Actualizar Datos de Clase' : 'Crear y Asignar Clase'}
                        </button>
                        {editandoClaseId && (
                          <button type="button" onClick={() => {setEditandoClaseId(null); setNuevaClaseTitulo(''); setNuevaClaseCurso(''); setNuevaClaseTarifa(''); setNuevaClaseDias(''); setNuevaClaseHorario(''); setEstudiantesSeleccionados([]); setNuevaClaseProfesorId('');}} className="btn-flotante" style={{ padding: '14px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                        )}
                      </div>
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
                            <span style={{ fontSize: '15px', fontWeight: '600', color: clase.archivada ? '#6b7280' : '#111827' }}>{clase.titulo || 'Sin Título'}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{clase.curso || '--'}</span>
                            <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Profesor asignado (ID): {getShortId(clase.profesorId, 5)}...</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={() => {
                                setNuevaClaseTitulo(clase.titulo); setNuevaClaseCurso(clase.curso); setNuevaClaseTarifa(clase.tarifa); setNuevaClaseDias(clase.dias); setNuevaClaseHorario(clase.horario); setNuevaClaseProfesorId(clase.profesorId); 
                                setEstudiantesSeleccionados((clase.estudiantes || []).filter(est => todosLosAlumnos.includes(est))); setEditandoClaseId(clase.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px', cursor: 'pointer', fontSize: '12px' }} title="Editar Alumnos o Datos">✏️</button>

                            <button onClick={() => handleToggleArchivarClase(clase.id, clase.archivada)} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', color: clase.archivada ? '#10b981' : '#f59e0b', fontWeight: '600' }}>{clase.archivada ? 'Desarchivar' : 'Archivar'}</button>
                            <button onClick={() => handleEliminarClase(clase.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Eliminar Permanente">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PROFESORES */}
              {adminTab === 'profesores' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'aparecerFade 0.3s ease' }}>
                  <div className="grid-resp-2">
                    
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
                              <div className="avatar" style={{ backgroundColor: prof.activo !== false ? prof.color : '#9ca3af', width: '36px', height: '36px', fontSize: '14px' }}>{getInitial(prof.nombre)}</div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: prof.activo !== false ? '#374151' : '#9ca3af', textDecoration: prof.activo !== false ? 'none' : 'line-through' }}>{prof.nombre || 'Sin Nombre'}</span>
                                <span style={{ fontSize: '11px', color: '#6b7280' }}>ID: {getShortId(prof.id, 8)}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <button onClick={() => handleToggleActivoProfesor(prof.id, prof.activo !== false)} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: prof.activo !== false ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                                {prof.activo !== false ? 'Dar de baja' : 'Reactivar'}
                              </button>
                              <button onClick={() => handleEliminarProfesor(prof.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Eliminar Permanente">🗑️</button>
                            </div>
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
    );
  }

  // ==========================================
  // PANTALLA 6: DASHBOARD DE PROFESOR
  // ==========================================
  if (profesorSeleccionado) {
    let mesPrefixPlanilla = "";
    if (mesPlanilla === "2026-08") mesPrefixPlanilla = "2026-08"; else if (mesPlanilla === "2026-07") mesPrefixPlanilla = "2026-07";
    const registrosMesProfesor = registrosFirebase.filter(reg => {
      if(reg.profesor !== profesorSeleccionado.nombre) return false;
      if(mesPrefixPlanilla === "") return true;
      const f = parseFechaUniversal(reg.fecha);
      return f.startsWith(mesPrefixPlanilla);
    });
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

    const misClasesProfesor = clasesFirebase.filter(c => c.profesorId === profesorSeleccionado.id);
    const misAlumnos = Array.from(new Set(misClasesProfesor.flatMap(c => c.estudiantes || [])))
      .filter(a => todosLosAlumnos.includes(a))
      .sort((a, b) => String(a).localeCompare(String(b)));

    return (
      <>
        {estilosGlobales}
        {mostrarError && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>⚠️</span><div><h4 style={{ margin: 0 }}>{mensajeError || 'Faltan datos obligatorios'}</h4></div></div>)}
        {mensajeExito && (<div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '12px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '24px' }}>☁️</span><div><h4 style={{ margin: 0 }}>{mensajeExito}</h4></div></div>)}

        {/* MODAL PARA EXAMEN FINAL */}
        {mostrarModalExamen && (
          <>
            <div onClick={() => setMostrarModalExamen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 999 }}></div>
            <div style={{ position: 'fixed', top: '50%', left: '50%', width: '90%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1000, transform: 'translate(-50%, -50%)', animation: 'aparecerFade 0.3s ease forwards' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>📝 Registrar FINAL EXAM</h2>
                <button onClick={() => setMostrarModalExamen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9ca3af', cursor: 'pointer' }}>✖</button>
              </div>
              <form onSubmit={handleGuardarExamen} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Fecha del Examen</label>
                  <input type="date" value={examenFecha} onChange={e => setExamenFecha(e.target.value)} className="input-flotante" style={{width:'100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box'}}/>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Buscar Alumno</label>
                  <input type="text" placeholder="Escribe para filtrar tus alumnos..." value={busquedaAlumnoExamen} onChange={e => setBusquedaAlumnoExamen(e.target.value)} className="input-flotante" style={{width:'100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '5px', boxSizing: 'border-box', fontSize: '12px'}}/>
                  <select value={examenAlumno} onChange={e => setExamenAlumno(e.target.value)} className="input-flotante" style={{width:'100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box'}}>
                    <option value="">-- Seleccionar Alumno --</option>
                    {misAlumnos.filter(a => safeIncludes(a, busquedaAlumnoExamen)).map((a,i) => <option key={i} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Nivel o Libro evaluado</label>
                  <input type="text" placeholder="Ej: Speak Up Level 3" value={examenNivel} onChange={e => setExamenNivel(e.target.value)} className="input-flotante" style={{width:'100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box'}}/>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#374151', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Nota Final (1 al 20)</label>
                  <input type="number" min="0" max="20" step="0.1" placeholder="Ej: 18.5" value={examenNota} onChange={e => setExamenNota(e.target.value)} className="input-flotante" style={{width:'100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box'}}/>
                </div>
                <button type="submit" className="btn-flotante" style={{background:'#2563eb', color:'white', padding:'14px', borderRadius:'8px', border:'none', fontWeight:'bold', marginTop: '10px', fontSize: '15px'}}>Guardar Examen Oficial</button>
              </form>
            </div>
          </>
        )}

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
                  <option value="todo">📚 Exportar todo el historial</option>
                  <option value="2026">Todo el 2026 (Anual)</option>
                  <option value="2025">Todo el 2025 (Anual)</option>
                  <option value="2024">Todo el 2024 (Anual)</option>
                  <optgroup label="Meses Específicos">
                    {opcionesMesesGlobal.map(m => <option key={m} value={m}>{formatMesTexto(m)}</option>)}
                  </optgroup>
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
                  {opcionesMesesGlobal.map(m => <option key={m} value={m}>{formatMesTexto(m)}</option>)}
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

        <div className="dashboard-layout">
          <div className="sidebar-prof">
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <button onClick={handleCerrarSesionProfesor} className="btn-flotante" style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '5px 10px', marginLeft: '-10px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>← Cerrar Sesión</button>
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <img src="/boss_accredible.png" alt="Logo" style={{ width: '90px', height: 'auto', objectFit: 'contain', marginBottom: '10px' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
                <div><h2 style={{ margin: '0 0 2px 0', fontSize: '18px', color: '#111827' }}>Mis Clases</h2><p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Cursos asignados</p></div>
              </div>
            </div>
            <div className="sidebar-menu">
              {misClases.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: '13px', marginTop: '20px' }}>No tienes clases asignadas aún.</p>
              ) : (
                misClases.map((clase) => (
                  <div key={clase.id} onClick={() => setClaseSeleccionada(clase)} className="btn-flotante admin-menu-btn" style={{ padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', marginBottom: '8px', backgroundColor: claseSeleccionada?.id === clase.id ? '#eff6ff' : 'transparent', border: claseSeleccionada?.id === clase.id ? '1px solid #bfdbfe' : '1px solid transparent', textAlign: 'left', display: 'block' }}>
                    <h4 style={{ margin: 0, color: claseSeleccionada?.id === clase.id ? '#1d4ed8' : '#374151', fontSize: '14px' }}>{clase.titulo}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{(clase.estudiantes||[]).length} alumno(s) • {clase.curso}</p>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setMostrarModalExamen(true)} className="btn-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>📝 Subir Final Exam</button>
              <button onClick={() => setMostrarPlanilla(true)} className="btn-flotante" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #10b981', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>📊 Ver y Exportar Pago</button>
            </div>
          </div>

          <div className="main-content">
            {claseSeleccionada ? (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', maxWidth: '900px', margin: '0 auto' }}>
                <div className="mobile-stack" style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: 1 }}></div>
                    <div style={{ flex: 2, textAlign: 'center' }}>
                      <h1 style={{ margin: 0, color: '#111827', fontSize: '24px' }}>
                        {editandoRegistroId ? '✏️ Editando Notas Anteriores' : 'Registro de Clase'}
                      </h1>
                      <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '15px' }}>Clase seleccionada: <strong style={{ color: '#374151' }}>{claseSeleccionada.titulo}</strong></p>
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => setMostrarModalExportar(true)} className="btn-flotante" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>📄 Exportar Reporte</button>
                    </div>
                  </div>
                  
                  {editandoRegistroId && (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '10px' }}>
                      <span style={{ color: '#d97706', fontSize: '13px', fontWeight: 'bold' }}>⚠️ Estás modificando un registro del pasado.</span>
                      <button onClick={() => {setEditandoRegistroId(null); setAsistencia({}); setNotas({}); setObsIndividual({}); setFechaClase(''); setHorasClase(''); setObsGeneral('');}} style={{ background: 'none', border: 'none', color: '#b45309', textDecoration: 'underline', cursor: 'pointer', marginLeft: '10px', fontSize: '13px' }}>Cancelar edición</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                    {(claseSeleccionada.estudiantes || []).filter(est => todosLosAlumnos.includes(est)).map((estudiante, index) => (
                      <div key={index} style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                          <h4 style={{ margin: '0', color: '#111827', fontSize: '16px', minWidth: '140px', textAlign: 'center', textTransform: 'capitalize' }}>{estudiante}</h4>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
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

                <div className="mobile-stack" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
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
                
                <button onClick={handleGuardarRegistro} className="btn-flotante" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: editandoRegistroId ? '#10b981' : '#2563eb', color: 'white', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
                  {editandoRegistroId ? '💾 Guardar Cambios (Sobrescribir)' : 'Guardar Registro Completo'}
                </button>

                {/* HISTORIAL DEL PROFESOR CON BOTON EDITAR */}
                <div style={{ marginTop: '40px', borderTop: '2px dashed #e5e7eb', paddingTop: '30px' }}>
                  <h3 style={{ fontSize: '16px', color: '#374151', marginBottom: '20px', textAlign: 'center' }}>📅 Registros Pasados de esta Clase</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                          <th style={{ padding: '10px' }}>Fecha</th>
                          <th style={{ padding: '10px' }}>Alumno</th>
                          <th style={{ padding: '10px' }}>Asistencia</th>
                          <th style={{ padding: '10px' }}>Notas</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrosFirebase.filter(r => r.clase === claseSeleccionada.titulo).sort((a,b) => (new Date(parseFechaUniversal(b.fecha)).getTime()||0) - (new Date(parseFechaUniversal(a.fecha)).getTime()||0)).map((reg, idx) => {
                          const nombres = Object.keys(reg.asistencia || {});
                          const nombresReales = nombres.filter(n => todosLosAlumnos.includes(n));
                          return nombresReales.map((alum, subIdx) => {
                            const estado = reg.asistencia?.[alum]; 
                            const colorEstado = estado === 'asistio' ? '#10b981' : estado === 'no-asistio' ? '#ef4444' : '#f59e0b';
                            const notaCol = (estado === 'asistio' || estado === 'reprogramo') ? formatNotasStr(reg.notas?.[alum]) : '--';
                            return (
                              <tr key={`${reg.id || idx}-${subIdx}`} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: editandoRegistroId === reg.id ? '#fffbeb' : 'transparent' }}>
                                  <td style={{ padding: '10px', fontWeight: '500' }}>{reg.fecha}</td>
                                  <td style={{ padding: '10px' }}>{alum}</td>
                                  <td style={{ padding: '10px', color: colorEstado, fontWeight: 'bold' }}>{String(estado||'--').replace('-', ' ')}</td>
                                  <td style={{ padding: '10px' }}>{notaCol}</td>
                                  <td style={{ padding: '10px', textAlign: 'center' }}>
                                    <button onClick={() => {
                                        setFechaClase(reg.fecha || ''); setHorasClase(reg.horas || ''); setAsistencia(reg.asistencia || {}); setNotas(reg.notas || {}); setObsIndividual(reg.observacionesIndividuales || {}); setObsGeneral(reg.observacionGeneral || ''); setEditandoRegistroId(reg.id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '5px' }} title="Editar este registro">✏️</button>
                                  </td>
                              </tr>
                            )
                          });
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', padding: '20px', textAlign: 'center' }}>
                <h3>Selecciona una clase del panel para comenzar</h3>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // PANTALLA 7: PORTAL DE ACCESO (GRID DE PROFESORES)
  // ==========================================
  if (accesoGlobal && !vistaAdmin && !profesorSeleccionado) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', backgroundColor: '#f4f6f8' }}>
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
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: profesorAAutenticar.color, color: 'white', fontSize: '24px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>{getInitial(profesorAAutenticar.nombre)}</div>
              <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '20px' }}>Hola, {getFirstName(profesorAAutenticar.nombre)}</h2>
              <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>Ingresa tu PIN de seguridad.</p>
              <form onSubmit={handleLoginProfesor}>
                <input type="password" placeholder="PIN" className="input-flotante" value={pinInput} onChange={(e) => setPinInput(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: errorPin ? '1px solid #ef4444' : '1px solid #d1d5db', outline: 'none', marginBottom: '16px', textAlign: 'center' }} autoFocus />
                <button type="submit" className="btn-flotante" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Ingresar</button>
              </form>
            </div>
          </>
        )}

        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
          <button onClick={() => {setAccesoGlobal(false); setModoIngreso('inicio')}} className="btn-flotante" style={{ background: 'white', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>🚪 Salir</button>
        </div>
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={() => setMostrarModalAdmin(true)} className="btn-flotante" style={{ background: '#111827', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>⚙️ Admin Panel</button>
        </div>
        <div style={{ marginTop: '40px', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/boss_accredible.png" alt="Logo" style={{ width: '120px', height: 'auto', marginBottom: '15px' }} onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=BLC&background=2563eb&color=fff&rounded=true' }} />
          <h1 style={{ color: '#1f2937', margin: '0 0 8px 0', fontWeight: '600', fontSize: '28px', padding: '0 15px' }}>Boss Language Center</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>Selecciona tu perfil docente para iniciar clase</p>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', maxWidth: '750px', margin: '0 auto', paddingBottom: '40px' }}>
          {profesores.filter(p => p.activo !== false).map((profesor) => (
            <div key={profesor.id} onClick={() => setProfesorAAutenticar(profesor)} className="tarjeta-notificacion" style={{ backgroundColor: 'white', margin: '0 15px' }}>
              <div className="avatar" style={{ backgroundColor: profesor.color }}>{getInitial(profesor.nombre)}</div>
              <div className="textos" style={{ textAlign: 'left' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1f1f1f', fontWeight: '600' }}>{profesor.nombre || 'Sin Nombre'}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#5f6368' }}>Language Teacher</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default App;