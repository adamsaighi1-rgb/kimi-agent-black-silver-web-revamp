import { useMemo, useRef, useState } from 'react';
import { MessageCircle, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { APP_ROUTES } from '@/lib/siteRoutes';
import type { FaqCategoryContent, HomePageContent } from '@/types/content';

gsap.registerPlugin(ScrollTrigger);

interface FAQProps {
  content: HomePageContent;
  categories: FaqCategoryContent[];
}

const AccordionItem = ({
  item,
  isOpen,
  onClick,
}: {
  item: { question: string; answer: string };
  isOpen: boolean;
  onClick: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-[#333333] last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 px-4 text-left hover:bg-[#1a1a1a]/50 transition-colors duration-300 group"
      >
        <span
          className={`text-base font-medium pr-8 transition-colors duration-300 ${
            isOpen ? 'text-[#d4a853]' : 'text-white group-hover:text-[#d4a853]'
          }`}
        >
          {item.question}
        </span>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'bg-[#d4a853] text-[#0a0a0a]' : 'bg-[#2d2d2d] text-white group-hover:bg-[#d4a853]/20 group-hover:text-[#d4a853]'
          }`}
        >
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 0}px` : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-4 pb-5 text-[#888888] leading-relaxed">{item.answer}</div>
      </div>
    </div>
  );
};

const FAQ = ({ content, categories }: FAQProps) => {
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order - b.order);
  }, [categories]);

  const [openCategories, setOpenCategories] = useState<string[]>(sortedCategories.length > 0 ? [sortedCategories[0].seedKey] : []);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories((previous) => {
      return previous.includes(categoryKey) ? previous.filter((key) => key !== categoryKey) : [...previous, categoryKey];
    });
  };

  const toggleItem = (itemKey: string) => {
    setOpenItems((previous) => {
      return previous.includes(itemKey) ? previous.filter((key) => key !== itemKey) : [...previous, itemKey];
    });
  };

  return (
    <section ref={sectionRef} className="py-20 section-padding">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[2px] bg-[#d4a853]" />
            <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase font-medium">{content.faqLabel}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {content.faqTitle} <span className="text-[#d4a853]">{content.faqTitleHighlight}</span>
          </h2>
          <p className="text-[#888888] leading-relaxed mb-6">{content.faqDescription}</p>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333333]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#d4a853]/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#d4a853]" />
              </div>
              <div>
                <p className="text-white font-medium">{content.faqContactQuestion}</p>
                <p className="text-[#888888] text-sm">{content.faqContactHelp}</p>
              </div>
            </div>
            <Link to={APP_ROUTES.contact} className="w-full btn-primary text-sm inline-flex items-center justify-center">
              {content.faqContactButton}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {sortedCategories.map((category) => {
            const isCategoryOpen = openCategories.includes(category.seedKey);

            return (
              <div key={category.seedKey} className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#333333] stagger-item">
                <button
                  onClick={() => toggleCategory(category.seedKey)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#2d2d2d]/50 transition-colors duration-300"
                >
                  <span className="text-lg font-bold text-white pr-4">{category.title}</span>
                  <div className={`flex-shrink-0 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`}>
                    <Plus className={`w-5 h-5 text-[#d4a853] transition-all duration-300 ${isCategoryOpen ? 'rotate-45' : ''}`} />
                  </div>
                </button>

                <div
                  className="overflow-hidden transition-all duration-500 ease-out"
                  style={{
                    maxHeight: isCategoryOpen ? '2000px' : '0',
                    opacity: isCategoryOpen ? 1 : 0,
                  }}
                >
                  <div className="px-2 pb-2">
                    {category.items.map((item, itemIndex) => {
                      const key = `${category.seedKey}-${itemIndex}`;

                      return (
                        <AccordionItem
                          key={key}
                          item={item}
                          isOpen={openItems.includes(key)}
                          onClick={() => toggleItem(key)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
