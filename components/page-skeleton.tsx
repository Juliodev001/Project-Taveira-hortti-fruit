const NAVY = '#2d3561'

function Shimmer({ width, height, radius = 8 }: { width?: string | number; height: number; radius?: number }) {
  return (
    <div
      style={{
        width: width ?? '100%',
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  )
}

export default function PageSkeleton({ cards = 3, rows = 5 }: { cards?: number; rows?: number }) {
  return (
    <div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Shimmer width={80} height={14} />
          <Shimmer width={220} height={28} />
          <Shimmer width={160} height={14} />
        </div>
        <Shimmer width={140} height={38} radius={10} />
      </div>

      {/* Cards */}
      {cards > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards}, 1fr)`, gap: 14, marginBottom: 24 }}>
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              style={{ backgroundColor: 'white', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #e5e7eb' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <Shimmer width="60%" height={13} />
                  <Shimmer width="80%" height={28} />
                </div>
                <Shimmer width={40} height={40} radius={10} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Shimmer width={160} height={16} />
          <Shimmer width={32} height={24} radius={20} />
        </div>
        <div style={{ padding: '0 22px' }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: i < rows - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center' }}
            >
              <Shimmer width={80} height={13} />
              <Shimmer width={120} height={13} />
              <Shimmer width={70} height={13} />
              <Shimmer width={70} height={26} radius={8} />
              <Shimmer width={70} height={26} radius={8} />
              <Shimmer width={100} height={13} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
