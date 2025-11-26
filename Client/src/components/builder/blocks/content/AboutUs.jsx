import { resolveColor } from '@/components/builder/utils/colorUtils';
import StyledText from "@/components/builder/atoms/StyledText";

export default function AboutUs({
  title,
  subtitle,
  story,
  mission,
  values = [],
  team = [],
  stats = [],
  showTeam,
  showStats,
  backgroundColor = "background",
  textColor = "text",
  globalStyles,
  blockId,
  anchorId
}) {

  const getColor = (colorKey) => {
    return resolveColor(colorKey, globalStyles);
  };

  return (
    <section
      className="py-20 px-4 md:px-8 relative overflow-hidden"
      style={{ backgroundColor: getColor(backgroundColor) }}
      id={anchorId || "about"}
      data-block-id={blockId}
      data-control="container"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: getColor('primary') }}></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: getColor('secondary') }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: getColor('surface'),
              color: getColor('primary')
            }}
            data-control="about-badge"
            data-block-id={blockId}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About Us
          </div>

          {title && (
            <StyledText
              tag="h2"
              className="text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              styleConfig={{
                fontFamily: globalStyles?.typography?.headingFont,
                color: getColor(textColor),
              }}
              dataControl="about-title"
              dataBlockId={blockId}
            >
              <span style={{
                background: `linear-gradient(to right, ${getColor('primary')}, ${getColor('secondary')})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}>
                {title}
              </span>
            </StyledText>
          )}

          {subtitle && (
            <StyledText
              tag="p"
              className="text-xl max-w-2xl mx-auto leading-relaxed"
              styleConfig={{ color: getColor(textColor) }}
              dataControl="about-subtitle"
              dataBlockId={blockId}
            >
              {subtitle}
            </StyledText>
          )}
        </div>
        {story && (
          <div className="mb-16" data-control="about-story" data-block-id={blockId}>
            <div className="rounded-2xl shadow-xl p-8 md:p-12" style={{ backgroundColor: getColor('surface') }}>
              <div className="prose prose-lg max-w-none">
                <StyledText
                  tag="div"
                  className="leading-relaxed whitespace-pre-line"
                  styleConfig={{ color: getColor(textColor) }}
                >
                  {story}
                </StyledText>
              </div>
            </div>
          </div>
        )}
        {(mission || values.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {mission && (
              <div
                className="rounded-2xl p-8"
                style={{ backgroundColor: getColor('surface') }}
                data-control="about-mission"
                data-block-id={blockId}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: getColor('primary') }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <StyledText tag="h3" className="text-2xl font-bold" styleConfig={{ color: getColor(textColor) }}>Our Mission</StyledText>
                </div>
                <StyledText tag="p" className="leading-relaxed" styleConfig={{ color: getColor(textColor) }}>{mission}</StyledText>
              </div>
            )}

            {values.length > 0 && (
              <div
                className="rounded-2xl p-8"
                style={{ backgroundColor: getColor('surface') }}
                data-control="about-values"
                data-block-id={blockId}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: getColor('secondary') }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <StyledText tag="h3" className="text-2xl font-bold" styleConfig={{ color: getColor(textColor) }}>Our Values</StyledText>
                </div>
                <div className="grid gap-4">
                  {values.map((value, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: getColor('secondary') }}></div>
                      <StyledText tag="span" styleConfig={{ color: getColor(textColor) }}>{value}</StyledText>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {showStats && stats.length > 0 && (
          <div className="mb-16" data-control="about-stats" data-block-id={blockId}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl shadow-lg p-6 text-center border"
                  style={{
                    backgroundColor: getColor('surface'),
                    borderColor: getColor('border')
                  }}
                >
                  <div className="text-3xl font-bold mb-2" style={{ color: getColor('primary') }}>{stat.value}</div>
                  <div className="font-medium" style={{ color: getColor(textColor) }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {showTeam && team.length > 0 && (
          <div data-control="about-team" data-block-id={blockId}>
            <div className="text-center mb-12">
              <StyledText tag="h3" className="text-3xl font-bold mb-4" styleConfig={{ color: getColor(textColor) }}>Meet Our Team</StyledText>
              <StyledText tag="p" className="max-w-2xl mx-auto" styleConfig={{ color: getColor(textColor) }}>
                The passionate people behind our success
              </StyledText>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="rounded-xl shadow-lg overflow-hidden border"
                  style={{
                    backgroundColor: getColor('surface'),
                    borderColor: getColor('border')
                  }}
                >
                  <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: getColor('surface') }}>
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: getColor('muted') }}>
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <StyledText tag="h4" className="text-xl font-bold mb-1" styleConfig={{ color: getColor(textColor) }}>{member.name}</StyledText>
                    <StyledText tag="p" className="font-medium mb-3" styleConfig={{ color: getColor('primary') }}>{member.role}</StyledText>
                    {member.bio && (
                      <StyledText tag="p" className="text-sm leading-relaxed" styleConfig={{ color: getColor(textColor) }}>{member.bio}</StyledText>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}