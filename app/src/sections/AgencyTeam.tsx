import { useMemo } from 'react';

import { useLocale } from '@/context/LocaleContext';
import { agencyTeamMembers, teamGroupOrder, type TeamGroupKey } from '@/data/agencyTeam';
import { uiCopy } from '@/lib/uiCopy';

const AgencyTeam = () => {
  const { locale } = useLocale();
  const copy = uiCopy[locale];

  const groupLabelByKey = useMemo<Record<TeamGroupKey, string>>(() => {
    return {
      Leadership: copy.groupLeadership,
      Advisors: copy.groupAdvisors,
      Administration: copy.groupAdministration,
      Marketing: copy.groupMarketing,
    };
  }, [copy.groupAdministration, copy.groupAdvisors, copy.groupLeadership, copy.groupMarketing]);

  const groups = useMemo(() => {
    return teamGroupOrder
      .map((group) => ({
        key: group,
        label: groupLabelByKey[group],
        members: agencyTeamMembers.filter((member) => member.group === group),
      }))
      .filter((group) => group.members.length > 0);
  }, [groupLabelByKey]);

  return (
    <section id="agency-team" className="py-20 section-padding">
      <div className="fade-up flex items-center gap-4 mb-6">
        <div className="w-12 h-[2px] bg-[#d4a853]" />
        <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase font-medium">{copy.agencyEyebrow}</span>
      </div>

      <h2 className="fade-up text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
        {copy.agencyTitleMain} <span className="text-[#d4a853]">{copy.agencyTitleAccent}</span>
      </h2>

      <p className="fade-up text-[#888888] max-w-3xl mb-12">{copy.agencyDescription}</p>

      <div className="space-y-14">
        {groups.map((group) => (
          <div key={group.key} className="fade-up">
            <h3 className="text-white text-xl md:text-2xl font-semibold mb-6">{group.label}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.members.map((member) => (
                <article
                  key={`${group.key}-${member.name}`}
                  className="bg-[#121212] border border-[#2a2a2a] rounded-2xl overflow-hidden group hover:border-[#d4a853]/40 transition-colors duration-300"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#0f0f0f]">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="text-white font-semibold text-base leading-tight">{member.name}</h4>
                    <p className="text-[#d4a853] text-sm mt-2">{member.role[locale]}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AgencyTeam;
