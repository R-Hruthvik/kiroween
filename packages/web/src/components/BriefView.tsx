import { useMemo, type JSX } from "react";
import { buildBrief, type DocumentTree } from "@augeron/core";
import { OberonTextRenderer } from "./OberonTextRenderer";

/**
 * View.Brief in the Document Track. Core picks the sentences. This component only lays them out.
 * Each address is a § link, so a click opens the paragraph in the split pane.
 */
export function BriefView({ tree, perSection }: { tree: DocumentTree; perSection: number }): JSX.Element {
  const brief = useMemo(() => buildBrief(tree, perSection), [tree, perSection]);
  return (
    <div className="brief" data-brief-per-section={perSection}>
      {brief.sections.map((section) => {
        const key = section.heading?.coordinate ?? "preamble";
        return (
          <section className="brief__section" key={key}>
            <h3 className="brief__heading">
              {section.heading ? (
                <>
                  <OberonTextRenderer text={section.heading.coordinate} idPrefix={`brief-h-${key}`} plainClickRuns={false} />{" "}
                  <OberonTextRenderer text={section.heading.text} idPrefix={`brief-ht-${key}`} plainClickRuns={false} />
                </>
              ) : (
                "Before the first heading"
              )}
              <span className="brief__count">
                {section.sentences.length} of {section.sentenceCount}
              </span>
            </h3>
            <ul className="brief__list">
              {section.sentences.map((sentence) => (
                <li
                  key={sentence.sentenceId}
                  className={sentence.context ? "brief__item brief__item--context" : "brief__item"}
                >
                  <span className="brief__address">
                    <OberonTextRenderer
                      text={sentence.coordinate}
                      idPrefix={`brief-addr-${sentence.sentenceId}`}
                      plainClickRuns={false}
                    />
                  </span>
                  <span className="brief__text">
                    <OberonTextRenderer
                      text={sentence.text}
                      idPrefix={`brief-${sentence.sentenceId}`}
                      plainClickRuns={false}
                      sourceCoord={sentence.coordinate}
                    />
                  </span>
                  {sentence.context ? <span className="brief__tag">context</span> : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="brief__footer">{brief.footer}</p>
    </div>
  );
}
