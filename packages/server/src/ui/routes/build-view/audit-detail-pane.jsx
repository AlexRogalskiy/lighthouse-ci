/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {h} from 'preact';
import './audit-detail-pane.css';
import clsx from 'clsx';
import {usePreviousValue} from '../../hooks/use-previous-value.jsx';
import {useEffect, useRef} from 'preact/hooks';
import {findAuditDiffs} from '@lhci/utils/src/audit-diff-finder.js';

/** @param {{audit: LH.AuditResult, baseAudit?: LH.AuditResult, key?: string}} props */
const Audit = props => {
  const diff = props.baseAudit ? findAuditDiffs(props.baseAudit, props.audit) : [];
  return (
    <div
      id={`audit-detail-pane-audit--${props.audit.id}`}
      className={clsx('audit-detail-pane__audit')}
    >
      <div className="audit-detail-pane__audit-title">{props.audit.title}</div>
      <div className="audit-detail-pane__audit-description">{props.audit.description}</div>
      <div className="audit-detail-pane__audit-details">
        <pre>{JSON.stringify(diff, null, 2)}</pre>
      </div>
    </div>
  );
};

/**
 * @param {{selectedAuditId: string, setSelectedAuditId: (id: string|null) => void, audits: Array<LH.AuditResult>, baseLhr?: LH.Result}} props
 */
export const AuditDetailPane = props => {
  /** @type {import('preact').Ref<HTMLElement|undefined>} */
  const paneElementRef = useRef(undefined);
  const previouslySelectedAuditId = usePreviousValue(props.selectedAuditId);

  // Scroll to the selected audit *when it changes*
  useEffect(() => {
    const auditId = props.selectedAuditId;
    const paneElement = paneElementRef.current;
    if (!paneElement || !auditId || auditId === previouslySelectedAuditId) return;

    const childElement = paneElement.querySelector(`#audit-detail-pane-audit--${auditId}`);
    if (!childElement || !(childElement instanceof HTMLElement)) return;

    paneElement.scrollTo(0, childElement.offsetTop);
  }, [props.selectedAuditId, previouslySelectedAuditId]);

  return (
    <div className="audit-detail-pane" ref={el => (paneElementRef.current = el)}>
      <div className="audit-detail-pane__close" onClick={() => props.setSelectedAuditId(null)}>
        x
      </div>
      {props.audits.map(audit => {
        if (!audit.id) return undefined;
        const id = audit.id;
        const baseAudit = props.baseLhr ? props.baseLhr.audits[id] : undefined;
        return (
          <Audit key={id} audit={{...audit, id}} baseAudit={baseAudit && {...baseAudit, id}} />
        );
      })}
    </div>
  );
};