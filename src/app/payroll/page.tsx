'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Plus,
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
  const [submittingStaff, setSubmittingStaff] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Salary Transaction Form
  const [transType, setTransType] = useState<'PAYMENT' | 'ADVANCE' | 'DEDUCTION'>('ADVANCE');
  const [transAmountRupees, setTransAmountRupees] = useState('');
  const [transNote, setTransNote] = useState('');
  const [submittingTrans, setSubmittingTrans] = useState(false);

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
    if (!empName.trim()) {
      setErrorMsg('Please enter Staff Member Name.');
      return;
    }

    try {
      setSubmittingStaff(true);
      setErrorMsg('');
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_EMPLOYEE',
          name: empName.trim(),
          role: empRole.trim() || 'Staff',
          phone: empPhone.trim(),
          monthlySalaryInPaise: toPaise(empSalaryRupees || '0'),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAddEmpModalOpen(false);
        setEmpName('');
        setEmpPhone('');
        setEmpSalaryRupees('');
        fetchPayroll();
      } else {
        setErrorMsg(data.error || 'Failed to create staff member.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error creating staff member.');
    } finally {
      setSubmittingStaff(false);
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
    if (!selectedEmp || !transAmountRupees || submittingTrans) return;

    try {
      setSubmittingTrans(true);
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
    } finally {
      setSubmittingTrans(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 text-black pb-12">
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
          onClick={() => {
            setErrorMsg('');
            setIsAddEmpModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow transition-all"
        >
          <UserPlus className="w-4 h-4 stroke-[2]" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Quick Add Staff Form Card */}
      <div className="bg-white border border-black rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <h2 className="text-xs font-black uppercase text-black tracking-wider">
              Quick Staff Member Registration
            </h2>
          </div>
          <span className="text-[10px] font-extrabold text-zinc-500">
            Instant Payroll Database Add
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-zinc-100 border border-black text-black rounded-2xl text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-black text-black block">Staff Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              className="w-full bg-zinc-50 text-black font-semibold text-xs px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-black text-black block">Role / Job Title</label>
            <input
              type="text"
              placeholder="e.g. Production Supervisor"
              value={empRole}
              onChange={(e) => setEmpRole(e.target.value)}
              className="w-full bg-zinc-50 text-black font-semibold text-xs px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-black text-black block">Phone Number</label>
            <input
              type="text"
              placeholder="+91 Mobile"
              value={empPhone}
              onChange={(e) => setEmpPhone(e.target.value)}
              className="w-full bg-zinc-50 text-black font-semibold text-xs px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-black text-black block">Monthly Base (₹)</label>
            <input
              type="number"
              placeholder="e.g. 20000"
              value={empSalaryRupees}
              onChange={(e) => setEmpSalaryRupees(e.target.value)}
              className="w-full bg-zinc-50 text-black font-black text-xs font-mono px-4 py-3 rounded-2xl border border-zinc-300 outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!empName.trim() || submittingStaff}
              className="w-full py-3 rounded-2xl bg-black hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider shadow transition-all flex items-center justify-center space-x-1.5 h-[46px]"
            >
              {submittingStaff ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>Save Staff</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Employee Cards Grid Sub-Section */}
      {loading ? (
        <div className="py-20 text-center text-zinc-400 font-bold text-sm">Loading staff database...</div>
      ) : employees.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-black bg-white font-semibold text-zinc-500">
          No staff members registered yet. Add your first employee above!
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
                      <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">Ph: {emp.phone || '—'}</p>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-2xl border border-black bg-white text-black space-y-4">
            <h3 className="text-lg font-black">Add Staff Member</h3>

            {errorMsg && (
              <div className="p-3 bg-zinc-100 border border-black text-black rounded-2xl text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 block mb-1">Full Name *</label>
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
                  disabled={submittingStaff}
                  className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-black shadow"
                >
                  {submittingStaff ? 'Saving...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Transaction Modal */}
      {isTransModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-2xl border border-black bg-white text-black space-y-4">
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
                  disabled={submittingTrans}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-black shadow"
                >
                  {submittingTrans ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
