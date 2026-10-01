import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Users, Check, Flame, Mountain, Home, Coffee, Info } from 'lucide-react';

export type SeatingZoneKey = 'terrace' | 'fireplace' | 'main_hall' | 'private_booth';

export interface CanvasTable {
  id: string;
  name: string;
  zone: SeatingZoneKey;
  zoneTitle: string;
  shape: 'circle' | 'rect';
  x: number; // center or top-left
  y: number;
  width: number; // or radius if shape === 'circle'
  height: number;
  capacity: number;
  perk: string;
  isReserved?: boolean;
}

export const RESTAURANT_TABLES: CanvasTable[] = [
  // Terrace View Zone (Top-Left)
  {
    id: 'T-1',
    name: 'T-1 · Cliffside Panorama',
    zone: 'terrace',
    zoneTitle: 'Terrace View',
    shape: 'circle',
    x: 65,
    y: 75,
    width: 22,
    height: 22,
    capacity: 2,
    perk: 'Unobstructed panorama of Kashmir Point pine valleys',
  },
  {
    id: 'T-2',
    name: 'T-2 · Alpine Mist Perch',
    zone: 'terrace',
    zoneTitle: 'Terrace View',
    shape: 'rect',
    x: 130,
    y: 55,
    width: 52,
    height: 40,
    capacity: 4,
    perk: 'Direct glass-railing perch with cool mountain breezes',
  },
  {
    id: 'T-3',
    name: 'T-3 · Pine Canopy Corner',
    zone: 'terrace',
    zoneTitle: 'Terrace View',
    shape: 'rect',
    x: 60,
    y: 155,
    width: 52,
    height: 40,
    capacity: 4,
    perk: 'Surrounded by fragrant Himalayan cedar pine branches',
  },
  {
    id: 'T-4',
    name: 'T-4 · Sunset Ridge Table',
    zone: 'terrace',
    zoneTitle: 'Terrace View',
    shape: 'rect',
    x: 135,
    y: 145,
    width: 64,
    height: 44,
    capacity: 6,
    perk: 'Premier corner with amber sunset views over Mall Road',
  },

  // Fireplace Corner Zone (Bottom-Left)
  {
    id: 'F-1',
    name: 'F-1 · Fireside Armchairs',
    zone: 'fireplace',
    zoneTitle: 'Fireplace Corner',
    shape: 'circle',
    x: 120,
    y: 260,
    width: 22,
    height: 22,
    capacity: 2,
    perk: 'Placed right beside the roaring stone fireplace',
  },
  {
    id: 'F-2',
    name: 'F-2 · Cedar Hearthside 4-Top',
    zone: 'fireplace',
    zoneTitle: 'Fireplace Corner',
    shape: 'rect',
    x: 105,
    y: 315,
    width: 54,
    height: 40,
    capacity: 4,
    perk: 'Cozy warmth and crackling wood embers',
  },
  {
    id: 'F-3',
    name: 'F-3 · Hearth Family Round',
    zone: 'fireplace',
    zoneTitle: 'Fireplace Corner',
    shape: 'rect',
    x: 180,
    y: 280,
    width: 62,
    height: 44,
    capacity: 6,
    perk: 'Spacious table benefiting from constant radiant hearth warmth',
  },

  // Central Grand Hall (Center)
  {
    id: 'M-1',
    name: 'M-1 · Chandelier Aisle',
    zone: 'main_hall',
    zoneTitle: 'Central Grand Hall',
    shape: 'rect',
    x: 290,
    y: 65,
    width: 52,
    height: 40,
    capacity: 4,
    perk: 'Directly beneath our bespoke Murree iron chandeliers',
  },
  {
    id: 'M-2',
    name: 'M-2 · Grand Center 6-Top',
    zone: 'main_hall',
    zoneTitle: 'Central Grand Hall',
    shape: 'rect',
    x: 370,
    y: 65,
    width: 64,
    height: 44,
    capacity: 6,
    perk: 'Prime central position for dining atmosphere and live service',
  },
  {
    id: 'M-3',
    name: 'M-3 · Courtyard Aisle',
    zone: 'main_hall',
    zoneTitle: 'Central Grand Hall',
    shape: 'rect',
    x: 290,
    y: 155,
    width: 52,
    height: 40,
    capacity: 4,
    perk: 'Quiet central hall setting near hotel garden courtyard',
  },
  {
    id: 'M-4',
    name: 'M-4 · Timber Beam 4-Top',
    zone: 'main_hall',
    zoneTitle: 'Central Grand Hall',
    shape: 'rect',
    x: 370,
    y: 155,
    width: 52,
    height: 40,
    capacity: 4,
    perk: 'Flanked by historic deodar timber architectural columns',
    isReserved: true, // Marked as reserved to show realistic status
  },
  {
    id: 'M-5',
    name: 'M-5 · Imperial Banquet Table',
    zone: 'main_hall',
    zoneTitle: 'Central Grand Hall',
    shape: 'rect',
    x: 310,
    y: 245,
    width: 96,
    height: 46,
    capacity: 8,
    perk: 'Long banquet layout designed for large family gatherings',
  },

  // Private Family Booths (Right)
  {
    id: 'P-1',
    name: 'P-1 · Curtained Pine Alcove',
    zone: 'private_booth',
    zoneTitle: 'Private Family Booth',
    shape: 'rect',
    x: 505,
    y: 135,
    width: 68,
    height: 46,
    capacity: 4,
    perk: 'Velvet curtained partition offering intimate family privacy',
  },
  {
    id: 'P-2',
    name: 'P-2 · Highland Family Suite',
    zone: 'private_booth',
    zoneTitle: 'Private Family Booth',
    shape: 'rect',
    x: 505,
    y: 220,
    width: 72,
    height: 50,
    capacity: 6,
    perk: 'Upholstered high-back booth seating with dedicated service bell',
  },
  {
    id: 'P-3',
    name: 'P-3 · Murree Honeymoon Nook',
    zone: 'private_booth',
    zoneTitle: 'Private Family Booth',
    shape: 'rect',
    x: 505,
    y: 305,
    width: 68,
    height: 46,
    capacity: 4,
    perk: 'Secluded corner alcove with dim candlelight and warm timber panels',
  },
];

interface InteractiveSeatingMapProps {
  selectedTableId?: string;
  guestCount?: number;
  activeZone?: SeatingZoneKey;
  onSelectTable: (table: CanvasTable) => void;
}

export const InteractiveSeatingMap: React.FC<InteractiveSeatingMapProps> = ({
  selectedTableId,
  guestCount = 2,
  activeZone,
  onSelectTable,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    table: CanvasTable | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    table: null,
  });

  const [filterZone, setFilterZone] = useState<SeatingZoneKey | 'all'>('all');

  // Internal logical resolution of canvas
  const LOGICAL_WIDTH = 610;
  const LOGICAL_HEIGHT = 380;

  // Find table from coordinates
  const hitTest = useCallback(
    (canvasX: number, canvasY: number): CanvasTable | null => {
      for (const table of RESTAURANT_TABLES) {
        if (table.shape === 'circle') {
          const dx = canvasX - table.x;
          const dy = canvasY - table.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= table.width + 6) return table;
        } else {
          // rect
          if (
            canvasX >= table.x - 4 &&
            canvasX <= table.x + table.width + 4 &&
            canvasY >= table.y - 4 &&
            canvasY <= table.y + table.height + 4
          ) {
            return table;
          }
        }
      }
      return null;
    },
    []
  );

  // Render canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Set actual canvas size for HiDPI
    canvas.width = LOGICAL_WIDTH * dpr;
    canvas.height = LOGICAL_HEIGHT * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // 1. Dark timber floor background
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // 2. Architectural Grid
    ctx.strokeStyle = '#181b24';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x <= LOGICAL_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, LOGICAL_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= LOGICAL_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(LOGICAL_WIDTH, y);
      ctx.stroke();
    }

    // 3. Zone Highlights & Architectural Landmarks
    // --- TERRACE ZONE (Top Left) ---
    ctx.fillStyle = 'rgba(40, 60, 50, 0.12)';
    ctx.fillRect(15, 15, 205, 195);
    ctx.strokeStyle = '#2d4a3e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(15, 15, 205, 195);
    ctx.setLineDash([]);

    // Terrace Railing (Glass Glass View)
    ctx.strokeStyle = '#3e705b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(15, 15);
    ctx.lineTo(15, 210);
    ctx.stroke();

    ctx.fillStyle = '#7fb385';
    ctx.font = '600 9px monospace';
    ctx.fillText('MOUNTAIN TERRACE (VALLEY VIEW)', 25, 32);

    // --- FIREPLACE ZONE (Bottom Left) ---
    ctx.fillStyle = 'rgba(70, 35, 20, 0.15)';
    ctx.fillRect(15, 225, 240, 140);
    ctx.strokeStyle = '#633820';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(15, 225, 240, 140);
    ctx.setLineDash([]);

    // Draw Fireplace Hearth at left wall
    ctx.fillStyle = '#3a2016';
    ctx.fillRect(16, 260, 28, 70);
    ctx.strokeStyle = '#e07a38';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 260, 28, 70);

    // Flame graphic
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(30, 295, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(30, 295, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e07a38';
    ctx.font = '600 9px monospace';
    ctx.fillText('HEARTH LOUNGE (STONE FIREPLACE)', 48, 242);

    // --- CENTRAL GRAND HALL (Center) ---
    ctx.fillStyle = 'rgba(28, 32, 45, 0.18)';
    ctx.fillRect(270, 15, 185, 350);
    ctx.strokeStyle = '#2c3345';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(270, 15, 185, 350);
    ctx.setLineDash([]);

    ctx.fillStyle = '#8ea1bd';
    ctx.font = '600 9px monospace';
    ctx.fillText('CENTRAL ARCHITECTURAL HALL', 282, 32);

    // --- BEVERAGE & COFFEE BAR (Top Right) ---
    ctx.fillStyle = '#1c1f2b';
    ctx.fillRect(480, 20, 115, 32);
    ctx.strokeStyle = '#363d52';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(480, 20, 115, 32);
    ctx.fillStyle = '#c5a880';
    ctx.font = '600 9px monospace';
    ctx.fillText('CHAI & ESPRESSO BAR', 488, 40);

    // --- PRIVATE FAMILY BOOTHS (Right Wall) ---
    ctx.fillStyle = 'rgba(50, 40, 25, 0.12)';
    ctx.fillRect(475, 80, 120, 285);
    ctx.strokeStyle = '#52432c';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(475, 80, 120, 285);
    ctx.setLineDash([]);

    ctx.fillStyle = '#d4af37';
    ctx.font = '600 9px monospace';
    ctx.fillText('PRIVATE BOOTHS', 492, 100);

    // --- HOTEL LOBBY ENTRANCE (Bottom Center) ---
    ctx.fillStyle = '#222530';
    ctx.fillRect(310, 365, 105, 15);
    ctx.strokeStyle = '#4a5068';
    ctx.lineWidth = 1;
    ctx.strokeRect(310, 365, 105, 15);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 8px monospace';
    ctx.fillText('HOTEL LOBBY ENTRANCE', 318, 375);

    // 4. Render Tables
    RESTAURANT_TABLES.forEach((table) => {
      const isSelected = selectedTableId === table.id;
      const isHovered = hoveredTableId === table.id;
      const isReserved = table.isReserved;
      const matchesFilter = filterZone === 'all' || table.zone === filterZone;
      const opacity = matchesFilter ? 1 : 0.35;

      ctx.save();
      ctx.globalAlpha = opacity;

      // Draw Chairs around table
      ctx.fillStyle = isSelected
        ? '#c5a880'
        : isHovered
        ? '#525a70'
        : isReserved
        ? '#1e212b'
        : '#2e3342';

      if (table.shape === 'circle') {
        const chairDist = table.width + 7;
        const chairRadius = 4;
        const numChairs = table.capacity;
        for (let i = 0; i < numChairs; i++) {
          const angle = (i * 2 * Math.PI) / numChairs;
          const cx = table.x + Math.cos(angle) * chairDist;
          const cy = table.y + Math.sin(angle) * chairDist;
          ctx.beginPath();
          ctx.arc(cx, cy, chairRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Rectangular chairs (top & bottom or left & right)
        const chairsPerSide = Math.ceil(table.capacity / 2);
        const chairW = 12;
        const chairH = 5;
        const step = table.width / (chairsPerSide + 1);

        for (let i = 1; i <= chairsPerSide; i++) {
          const cx = table.x + i * step - chairW / 2;
          // Top chair
          ctx.fillRect(cx, table.y - 7, chairW, chairH);
          // Bottom chair
          ctx.fillRect(cx, table.y + table.height + 2, chairW, chairH);
        }
      }

      // Draw Table Body
      if (isSelected) {
        // Glowing Gold Table
        ctx.shadowColor = 'rgba(197, 168, 128, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#c5a880';
        ctx.strokeStyle = '#f3ede4';
        ctx.lineWidth = 2.5;
      } else if (isHovered && !isReserved) {
        ctx.shadowColor = 'rgba(197, 168, 128, 0.4)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#262a38';
        ctx.strokeStyle = '#c5a880';
        ctx.lineWidth = 2;
      } else if (isReserved) {
        ctx.fillStyle = '#14161f';
        ctx.strokeStyle = '#2f3445';
        ctx.lineWidth = 1;
      } else {
        ctx.fillStyle = '#181b24';
        ctx.strokeStyle = '#3d4458';
        ctx.lineWidth = 1.5;
      }

      if (table.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(table.x, table.y, table.width, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        // Slightly rounded rectangle
        const r = 4;
        ctx.roundRect(table.x, table.y, table.width, table.height, r);
        ctx.fill();
        ctx.stroke();
      }

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw Table Code & Capacity Label
      const centerX = table.shape === 'circle' ? table.x : table.x + table.width / 2;
      const centerY = table.shape === 'circle' ? table.y : table.y + table.height / 2;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isSelected) {
        ctx.fillStyle = '#0e0f12';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(table.id, centerX, centerY - 4);
        ctx.font = '600 8px sans-serif';
        ctx.fillText(`✓ ${table.capacity}p`, centerX, centerY + 6);
      } else if (isReserved) {
        ctx.fillStyle = '#5c647a';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(table.id, centerX, centerY - 3);
        ctx.font = '500 7px monospace';
        ctx.fillText('BOOKED', centerX, centerY + 6);
      } else {
        ctx.fillStyle = '#ede8e1';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(table.id, centerX, centerY - 3);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '500 8px sans-serif';
        ctx.fillText(`${table.capacity}p`, centerX, centerY + 6);
      }

      ctx.restore();
    });
  }, [selectedTableId, hoveredTableId, filterZone]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Sync activeZone prop with filter
  useEffect(() => {
    if (activeZone) {
      setFilterZone(activeZone);
    }
  }, [activeZone]);

  // Handle Mouse Events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const hit = hitTest(canvasX, canvasY);

    if (hit) {
      setHoveredTableId(hit.id);
      canvas.style.cursor = hit.isReserved ? 'not-allowed' : 'pointer';
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        table: hit,
      });
    } else {
      setHoveredTableId(null);
      canvas.style.cursor = 'default';
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleMouseLeave = () => {
    setHoveredTableId(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const hit = hitTest(canvasX, canvasY);
    if (hit && !hit.isReserved) {
      onSelectTable(hit);
    }
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = LOGICAL_WIDTH / rect.width;
    const scaleY = LOGICAL_HEIGHT / rect.height;

    const canvasX = (touch.clientX - rect.left) * scaleX;
    const canvasY = (touch.clientY - rect.top) * scaleY;

    const hit = hitTest(canvasX, canvasY);
    if (hit && !hit.isReserved) {
      onSelectTable(hit);
      setTooltip({
        visible: true,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        table: hit,
      });
    }
  };

  const selectedTable = RESTAURANT_TABLES.find((t) => t.id === selectedTableId);

  return (
    <div className="w-full space-y-3">
      {/* Zone Quick Filters (Zero-Pill Discipline) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#9a9488]">
          <span className="uppercase tracking-wider font-mono text-[11px] text-[#c5a880] flex items-center gap-1">
            <Mountain className="w-3.5 h-3.5" />
            Pick Table Location
          </span>
          <span className="text-[11px] text-[#6e6a62] hidden sm:inline">
            (Interactive Canvas Grid)
          </span>
        </div>

        {/* Zone Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { key: 'all', label: 'All Floor' },
              { key: 'terrace', label: 'Terrace View' },
              { key: 'fireplace', label: 'Fireplace' },
              { key: 'main_hall', label: 'Central Hall' },
              { key: 'private_booth', label: 'Booths' },
            ] as const
          ).map((z) => (
            <button
              key={z.key}
              type="button"
              onClick={() => setFilterZone(z.key)}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                filterZone === z.key
                  ? 'bg-[#c5a880] text-[#0e0f12] font-semibold'
                  : 'bg-[#181a22] text-[#8a857b] hover:text-[#ede8e1] border border-[#272b38]'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Grid Area */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[610/380] bg-[#0f1117] border border-[#272b38] overflow-hidden select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          className="w-full h-full block"
          style={{ imageRendering: 'auto' }}
        />

        {/* Hover / Touch Tooltip Overlay */}
        {tooltip.visible && tooltip.table && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[#141722]/95 backdrop-blur-md border border-[#c5a880]/70 p-2.5 shadow-2xl text-left min-w-[190px] max-w-[240px]"
            style={{
              left: Math.max(100, Math.min(tooltip.x, (containerRef.current?.clientWidth || 500) - 100)),
              top: Math.max(70, tooltip.y - 12),
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#252a38] pb-1.5 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#c5a880]">
                {tooltip.table.id}
              </span>
              <span
                className={`text-[9px] uppercase font-mono px-1.5 py-0.5 ${
                  tooltip.table.isReserved
                    ? 'bg-[#331c1c] text-[#f87171] border border-[#5c2828]'
                    : 'bg-[#142318] text-[#7fb385] border border-[#284f33]'
                }`}
              >
                {tooltip.table.isReserved ? 'Booked' : 'Available'}
              </span>
            </div>

            <p className="text-xs font-semibold text-[#f3ede4] leading-tight mb-1">
              {tooltip.table.name.split('·')[1]?.trim() || tooltip.table.name}
            </p>

            <div className="text-[10px] text-[#9ca3af] space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[#8a857b]">Zone:</span>
                <span className="text-[#ede8e1]">{tooltip.table.zoneTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#8a857b]">Capacity:</span>
                <span className="text-[#ede8e1]">{tooltip.table.capacity} Guests</span>
              </div>
            </div>

            <p className="text-[10px] text-[#c5a880] mt-1.5 pt-1.5 border-t border-[#252a38] italic">
              "{tooltip.table.perk}"
            </p>

            {!tooltip.table.isReserved && (
              <span className="block mt-1 text-[9px] uppercase tracking-wider font-mono text-[#7fb385] font-semibold text-right">
                Tap to Select table
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selected Table Confirmation Card & Map Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#141720] border border-[#282c3a]">
        {/* Selected State */}
        {selectedTable ? (
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#c5a880] text-[#0e0f12] flex items-center justify-center font-mono font-bold text-sm shrink-0">
              {selectedTable.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#f3ede4]">
                  {selectedTable.name}
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#1c2e22] text-[#7fb385] border border-[#30593b]">
                  Selected
                </span>
              </div>
              <p className="text-[11px] text-[#9ca3af]">
                {selectedTable.zoneTitle} · Capacity: {selectedTable.capacity} Guests · {selectedTable.perk}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#8a857b] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#c5a880]" />
            <span>Click any available table on the canvas above to assign your preferred spot.</span>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8a857b] shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#222532]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#181b24] border border-[#3d4458]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#c5a880]" />
            <span className="text-[#c5a880]">Your Pick</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#14161f] border border-[#2f3445]" />
            <span>Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
