import React, { useState } from 'react';
import { X, Calendar, Users, Clock, MapPin, CheckCircle, Sparkles, Phone, Download, Compass } from 'lucide-react';
import { ConfirmedReservation, ReservationRequest } from '../types/restaurant';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { saveNewReservation } from '../services/storageService';
import {
  InteractiveSeatingMap,
  CanvasTable,
  RESTAURANT_TABLES,
} from './InteractiveSeatingMap';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  '12:30 PM',
  '01:30 PM',
  '02:30 PM',
  '06:30 PM',
  '07:30 PM',
  '08:30 PM',
  '09:30 PM',
  '10:30 PM',
];

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<ReservationRequest>({
    fullName: '',
    phone: '',
    email: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '08:30 PM',
    guests: 2,
    seatingArea: 'terrace',
    selectedTableId: 'T-2',
    selectedTableName: 'T-2 · Alpine Mist Perch (Terrace View)',
    specialRequests: '',
  });

  const [confirmed, setConfirmed] = useState<ConfirmedReservation | null>(null);

  if (!isOpen) return null;

  const handleSelectTable = (table: CanvasTable) => {
    setFormData((prev) => ({
      ...prev,
      seatingArea: table.zone,
      selectedTableId: table.id,
      selectedTableName: `${table.name} (${table.zoneTitle})`,
    }));
  };

  const handleSeatingAreaChange = (
    newArea: 'terrace' | 'fireplace' | 'main_hall' | 'private_booth'
  ) => {
    const tableInZone = RESTAURANT_TABLES.find((t) => t.zone === newArea && !t.isReserved);
    setFormData((prev) => ({
      ...prev,
      seatingArea: newArea,
      selectedTableId: tableInZone ? tableInZone.id : prev.selectedTableId,
      selectedTableName: tableInZone
        ? `${tableInZone.name} (${tableInZone.zoneTitle})`
        : prev.selectedTableName,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    const tableAssigned =
      formData.selectedTableName ||
      (formData.seatingArea === 'terrace'
        ? `T-2 · Alpine Mist Perch (Terrace View)`
        : formData.seatingArea === 'fireplace'
        ? `F-1 · Fireside Armchairs (Fireplace Corner)`
        : `M-1 · Chandelier Aisle (Grand Hall)`);

    const randomCode = `SB-${Math.floor(1000 + Math.random() * 9000)}`;

    const confirmation: ConfirmedReservation = {
      ...formData,
      confirmationCode: randomCode,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tableNumber: tableAssigned,
    };

    saveNewReservation(confirmation);
    setConfirmed(confirmation);
  };

  const handleReset = () => {
    setConfirmed(null);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#07080a]/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl lg:max-w-4xl w-full bg-[#12141a] border border-[#2b2e3a] p-5 sm:p-8 my-6 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#9a9488] hover:text-[#ede8e1] transition-colors z-20"
          aria-label="Close Reservation Window"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          /* Confirmation Luxury Pass */
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-[#1c221e] border border-[#3e5f44] flex items-center justify-center mx-auto mb-4 text-[#c5a880]">
              <Sparkles className="w-6 h-6" />
            </div>

            <span className="text-xs uppercase tracking-widest text-[#c5a880] block mb-1">
              Table Confirmed & Reserved
            </span>
            <h3 className="font-display text-3xl text-[#f3ede4] mb-2">
              We Await Your Arrival in Murree
            </h3>
            <p className="text-xs text-[#9a9488] max-w-md mx-auto mb-6">
              Your requested table has been locked in our dining system at Sariya's Sip N Bite inside Lucky Kabana Hotel.
            </p>

            {/* Printable Pass Ticket */}
            <div className="bg-[#0e0f12] border border-[#252830] p-6 text-left mb-6 relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#1f222a] text-xs">
                <div>
                  <span className="text-[#8a857b] block">Reservation Pass</span>
                  <span className="font-semibold text-[#f3ede4] text-sm">{confirmed.fullName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#8a857b] block">Booking Reference</span>
                  <span className="font-mono text-[#c5a880] font-bold text-sm">
                    {confirmed.confirmationCode}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-[#1f222a] text-xs">
                <div>
                  <span className="text-[#8a857b] block">Date & Time</span>
                  <span className="text-[#ede8e1] font-medium">{confirmed.date} · {confirmed.time}</span>
                </div>
                <div>
                  <span className="text-[#8a857b] block">Party Size</span>
                  <span className="text-[#ede8e1] font-medium">{confirmed.guests} Guests</span>
                </div>
                <div className="sm:col-span-2 p-2.5 bg-[#161822] border border-[#2b3040]">
                  <span className="text-[10px] text-[#c5a880] uppercase tracking-wider block font-mono">
                    Assigned Table & Area Pick
                  </span>
                  <span className="text-[#f3ede4] font-medium text-sm font-mono block mt-0.5">
                    {confirmed.tableNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[#8a857b] block">Location</span>
                  <span className="text-[#ede8e1]">Lucky Kabana Hotel, Mall Rd (2,291m)</span>
                </div>
                <div>
                  <span className="text-[#8a857b] block">Contact Phone</span>
                  <span className="text-[#ede8e1]">{confirmed.phone}</span>
                </div>
              </div>

              {confirmed.specialRequests && (
                <div className="pt-3 pb-1 text-xs text-[#9a9488]">
                  <span className="text-[#8a857b] block text-[10px] uppercase font-mono">Special Request:</span>
                  <span className="italic">"{confirmed.specialRequests}"</span>
                </div>
              )}

              <div className="pt-3 text-[11px] text-[#8a857b] flex items-center justify-between border-t border-[#1f222a] mt-3">
                <span>Hold time: 20 minutes from booking hour</span>
                <span>Phone: {RESTAURANT_INFO.phone}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`tel:${RESTAURANT_INFO.phoneClean}`}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-[#393d4a] hover:border-[#c5a880] text-[#ede8e1] flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Call Restaurant</span>
              </a>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Input */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-[#222530] pb-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#c5a880] mb-1 font-mono">
                <Compass className="w-3.5 h-3.5" />
                <span>Hospitality Reservations · Mall Road, Murree</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl text-[#f3ede4]">
                Reserve Your Table
              </h3>
              <p className="text-xs text-[#9a9488] mt-1">
                Select your preferred table from our interactive floor plan — from the misty Terrace View to the roaring stone Fireplace.
              </p>
            </div>

            {/* Guest Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] mb-1 font-mono">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="e.g. Asad Malik"
                  className="w-full px-3 py-2 bg-[#171922] border border-[#282c38] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] mb-1 font-mono">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 bg-[#171922] border border-[#282c38] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] mb-1 font-mono">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#171922] border border-[#282c38] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] mb-1 font-mono">
                  Time Slot
                </label>
                <select
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#171922] border border-[#282c38] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seating Preference & Party Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] mb-1 font-mono">
                  Party Size
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) =>
                    setFormData({ ...formData, guests: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-[#171922] border border-[#282c38] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none tabular-nums"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] mb-1 font-mono">
                  Area Zone
                </label>
                <select
                  value={formData.seatingArea}
                  onChange={(e) =>
                    handleSeatingAreaChange(e.target.value as any)
                  }
                  className="w-full px-3 py-2 bg-[#171922] border border-[#282c38] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
                >
                  <option value="terrace">Terrace View (Alpine Valley & Mist)</option>
                  <option value="fireplace">Fireplace Corner (Cozy Hearthstone)</option>
                  <option value="main_hall">Central Grand Hall (Architectural Aisle)</option>
                  <option value="private_booth">Private Booths (Curtained Alcove)</option>
                </select>
              </div>
            </div>

            {/* INTERACTIVE CANVAS SEATING MAP */}
            <div className="border border-[#282c3a] bg-[#0c0e14] p-3 sm:p-4 space-y-2">
              <InteractiveSeatingMap
                selectedTableId={formData.selectedTableId}
                activeZone={formData.seatingArea}
                guestCount={formData.guests}
                onSelectTable={handleSelectTable}
              />
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9a9488] mb-1 font-mono">
                Special Requests or Dietary Notes
              </label>
              <input
                type="text"
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                placeholder="e.g. High chair needed, anniversary surprise, extra heating near table"
                className="w-full px-3.5 py-2.5 bg-[#171922] border border-[#282c38] text-xs text-[#ede8e1] focus:border-[#c5a880] focus:outline-none"
              />
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-[#222530] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#8a857b]">
                Selected Table: <span className="font-mono text-[#c5a880] font-semibold">{formData.selectedTableName || 'Auto-Assigned'}</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#c5a880] text-[#0e0f12] hover:bg-[#d8ba91] transition-colors"
              >
                Confirm Table Reservation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
