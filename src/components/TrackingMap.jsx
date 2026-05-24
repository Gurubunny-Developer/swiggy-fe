import { useMemo, useState } from 'react';
import { ChefHat, Home, Truck } from 'lucide-react';

export const TrackingMap = ({ status }) => {
  // Translate order status into path percentage for the delivery rider
  // 0% - Confirmed
  // 30% - Preparing
  // 75% - Out for Delivery
  // 100% - Delivered
  const pct = useMemo(() => {
    switch (status) {
      case 'Confirmed': return 5;
      case 'Preparing': return 35;
      case 'Out for Delivery': return 75;
      case 'Delivered': return 100;
      default: return 5;
    }
  }, [status]);

  // SVG dimensions: 600x300
  // Path starts at Restaurant (120, 150) and goes to Home (480, 150)
  // We'll create a winding road for aesthetic realism
  const pathD = "M 120 150 C 180 80, 240 220, 300 150 C 360 80, 420 220, 480 150";

  // Calculate coordinates of point on path based on percentage
  // Since we cannot run complex getPointAtLength in standard SSR/React easily without DOM access,
  // we will approximate or let a DOM reference fetch the point.
  const [pathRef, setPathRef] = useState(null);

  const riderCoords = useMemo(() => {
    if (!pathRef) {
      return { x: 120, y: 150 };
    }
    try {
      const totalLength = pathRef.getTotalLength();
      const lengthAtPct = totalLength * (pct / 100);
      const point = pathRef.getPointAtLength(lengthAtPct);
      return { x: point.x, y: point.y };
    } catch {
      const ratio = pct / 100;
      const x = 120 + (480 - 120) * ratio;
      const y = 150 + Math.sin(ratio * Math.PI * 2.5) * 50;
      return { x, y };
    }
  }, [pct, pathRef]);

  return (
    <div className="tracking-map-container glass-panel">
      <div className="map-header">
        <div className="map-title">Real-Time Delivery Route</div>
        <div className="map-badge animate-pulse-glow">
          {status === 'Delivered' ? 'Delivered successfully' : 'Rider is on the way'}
        </div>
      </div>

      <div className="svg-map-wrapper">
        <svg viewBox="0 0 600 300" className="delivery-svg">
          {/* Grid Background Patterns */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" rx="16" />

          {/* Road Network (Background roads in gray) */}
          <path d="M 50 150 L 550 150" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 300 30 L 300 270" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />

          {/* Delivery Road Path */}
          <path 
            ref={(ref) => setPathRef(ref)}
            d={pathD} 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeWidth="8" 
            strokeLinecap="round"
          />

          {/* Completed Road Path (Orange path indicator matching rider progress) */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="var(--color-primary)" 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray="600"
            strokeDashoffset={600 - (600 * (pct / 100))}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />

          {/* Restaurant Marker (Source) */}
          <g transform="translate(120, 150)">
            <circle r="22" fill="var(--bg-secondary)" stroke="var(--color-primary)" strokeWidth="2" className="pulse-marker" />
            <circle r="30" fill="none" stroke="var(--color-primary)" strokeWidth="1" className="ping-ring-1" />
            <g transform="translate(-10, -10)">
              <ChefHat size={20} className="svg-icon-accent" style={{ color: 'var(--color-primary)' }} />
            </g>
          </g>

          {/* Home Marker (Destination) */}
          <g transform="translate(480, 150)">
            <circle r="22" fill="var(--bg-secondary)" stroke="var(--color-secondary)" strokeWidth="2" className="pulse-marker-blue" />
            <circle r="30" fill="none" stroke="var(--color-secondary)" strokeWidth="1" className="ping-ring-2" />
            <g transform="translate(-10, -10)">
              <Home size={20} className="svg-icon-secondary" style={{ color: 'var(--color-secondary)' }} />
            </g>
          </g>

          {/* Delivery Rider Marker (Moving Object) */}
          {status !== 'Delivered' && (
            <g 
              transform={`translate(${riderCoords.x}, ${riderCoords.y})`}
              style={{ transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
            >
              {/* Glowing shadow circle */}
              <circle r="18" fill="var(--color-primary)" opacity="0.3" className="rider-glow" />
              <circle r="12" fill="var(--color-primary)" />
              <g transform="translate(-8, -8)">
                <Truck size={16} style={{ color: '#fff' }} />
              </g>
            </g>
          )}

          {/* Texts labels */}
          <text x="120" y="195" fill="var(--text-primary)" fontSize="12" fontWeight="600" textAnchor="middle">Kitchen</text>
          <text x="480" y="195" fill="var(--text-primary)" fontSize="12" fontWeight="600" textAnchor="middle">Your House</text>
        </svg>
      </div>

      {/* Delivery details display card */}
      <div className="map-rider-info">
        <div className="rider-avatar">
          <div className="avatar-placeholder">R</div>
        </div>
        <div className="rider-details">
          <div className="rider-name">Rahul Sharma</div>
          <div className="rider-rating">★ 4.9 (Courier Partner)</div>
        </div>
        <div className="rider-action">
          <a href="tel:9876543210" className="call-rider-btn">Call Rider</a>
        </div>
      </div>
    </div>
  );
};
export default TrackingMap;
