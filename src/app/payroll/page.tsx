'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatRupees, toPaise } from '@/lib/money';

interface Attendance {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
}

interface SalaryTransaction {
  id: string;
  date: string;
  type: 'PAYMENT' | 'ADVANCE' | 'DEDUCTION';
  amountInPaise: number;
  note?: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  monthlySalaryInPaise: number;
  attendances: Attendance[];
  salaryTransactions: SalaryTransaction[];
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // New Employee Form
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Production Staff');
  const [empPhone, setEmpPhone] = useState('');
  const [empSalaryRupees, setEmpSalaryRupees] = useState('');

  // Salary Transaction Form
  const [transType, setTransType] = useState<'PAYMENT' | 'ADVANCE' | 'DEDUCTION'>('ADVANCE');
  const [transAmountRupees, setTransAmountRupees] = useState('');
  const [transNote, setTransNote] = useState('');

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payroll');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empSalaryRupees) return;

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_EMPLOYEE',
          name: empName,
          role: empRole,
          phone: empPhone,
          monthlySalaryInPaise: toPaise(empSalaryRupees),
        }),
      });

      if (res.ok) {
        setIsAddEmpModalOpen(false);
        setEmpName('');
        setEmpSalaryRupees('');
        fetchPayroll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordAttendance = async (employeeId: string, status: 'PRESENT' | 'ABSENT' | 'HALF_DAY') => {
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_ATTENDANCE',
          employeeId,
          date: new Date().toISOString(),
          status,
        }),
      });
      if (res.ok) {
        fetchPayroll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalaryTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !transAmountRupees) return;

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SALARY_TRANSACTION',
          employeeId: selectedEmp.id,
          type: transType,
          amountInPaise: toPaise(transAmountRupees),
          note: transNote,
        }),
      });

      if (res.ok) {
        setIsTransModalOpen(false);
        setTransAmountRupees('');
        setTransNote('');
        fetchPayroll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 text-black">
      {/* Sub-Section Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-black bg-white p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black flex items-center space-x-3">
            <Users className="w-7 h-7 text-black stroke-[1.5]" />
            <span>Staff Payroll & Attendance</span>
          </h1>
          <p className="text-zinc-500 text-xs font-semibold mt-1">
            Employee database, daily attendance logging, monthly salary advances and deductions.
          </p>
        </div>

        <button
          onClick={() => setIsAddEmpModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow transition-all"
        >
          <UserPlus className="w-4 h-4 stroke-[2]" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employee Cards Grid Sub-Section */}
      {loading ? (
        <div className="py-20 text-center text-zinc-400 font-bold text-sm">Loading staff database...</div>
      ) : employees.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-black bg-white font-semibold text-zinc-400">
          No staff members registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employees.map((emp) => {
            const todayAtt = emp.attendances.find((a) => a.date.startsWith(todayStr));

            const totalAdvancesPaise = emp.salaryTransactions
              .filter((t) => t.type === 'ADVANCE')
              .reduce((acc, t) => acc + t.amountInPaise, 0);

            const netSalaryPaise = emp.monthlySalaryInPaise - totalAdvancesPaise;

            return (
              <div
                key={emp.id}
                className="border border-black bg-white rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-lg text-black">
                        {emp.name}
                      </h3>
                      <span className="text-xs text-black font-extrabold">{emp.role}</span>
                      <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">Ph: {emp.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block font-bold uppercase">Monthly Base</span>
                      <span className="font-black text-sm font-mono text-black">
                        {formatRupees(emp.monthlySalaryInPaise)}
                      </span>
                    </div>
                  </div>

                  {/* Today Attendance Logger */}
                  <div className="p-3 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-2">
                    <span className="text-[10px] font-extrabold text-black uppercase tracking-wider block">
                      Today Attendance:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleRecordAttendance(emp.id, 'PRESENT')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1 transition-all ${
                          todayAtt?.status === 'PRESENT'
                            ? 'bg-black text-white shadow'
                            : 'bg-white text-black border border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>Present</span>
                      </button>
                      <button
                        onClick={() => handleRecordAttendance(emp.id, 'HALF_DAY')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1 transition-all ${
                          todayAtt?.status === 'HALF_DAY'
                            ? 'bg-black text-white shadow'
                            : 'bg-white text-black border border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>Half Day</span>
                      </button>
                      <button
                        onClick={() => handleRecordAttendance(emp.id, 'ABSENT')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1 transition-all ${
                          todayAtt?.status === 'ABSENT'
                            ? 'bg-black text-white shadow'
                            : 'bg-white text-black border border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>

                  {/* Financial Advances Breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-2xl border border-zinc-200 bg-zinc-50">
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-bold">Salary Advances Taken</span>
                      <span className="font-black text-black font-mono">
                        {formatRupees(totalAdvancesPaise)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-bold">Net Balance Payable</span>
                      <span className="font-black text-black font-mono">
                        {formatRupees(netSalaryPaise)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Salary Action Button */}
                <div className="pt-3 border-t border-zinc-200">
                  <button
                    onClick={() => {
                      setSelectedEmp(emp);
                      setIsTransModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all border border-black bg-black hover:bg-zinc-800 text-white"
                  >
                    <CreditCard className="w-4 h-4 stroke-[1.5]" />
                    <span>Record Advance / Payout</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-2xl border border-black bg-white text-black space-y-5">
            <h3 className="text-lg font-black">Add Staff Member</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Employee Name"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Role / Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Production Supervisor"
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 Phone"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Monthly Base Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 22000"
                  value={empSalaryRupees}
                  onChange={(e) => setEmpSalaryRupees(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-black font-mono outline-none focus:border-black"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddEmpModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 text-black border border-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-black shadow"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Transaction Modal */}
      {isTransModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-2xl border border-black bg-white text-black space-y-5">
            <h3 className="text-lg font-black">
              Salary Transaction for {selectedEmp.name}
            </h3>
            <form onSubmit={handleSalaryTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransType('ADVANCE')}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      transType === 'ADVANCE'
                        ? 'bg-black text-white shadow'
                        : 'bg-zinc-100 text-black border border-zinc-300'
                    }`}
                  >
                    Salary Advance
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransType('PAYMENT')}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      transType === 'PAYMENT'
                        ? 'bg-black text-white shadow'
                        : 'bg-zinc-100 text-black border border-zinc-300'
                    }`}
                  >
                    Monthly Payout
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={transAmountRupees}
                  onChange={(e) => setTransAmountRupees(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-black font-mono outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency advance for personal work"
                  value={transNote}
                  onChange={(e) => setTransNote(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 bg-zinc-50 text-black text-xs font-semibold outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 text-black border border-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-black shadow"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
