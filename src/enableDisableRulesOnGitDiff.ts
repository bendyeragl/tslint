/**
 * @license
 * Copyright 2014 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// tslint:disable object-literal-sort-keys

import { execSync } from "child_process";
import * as ts from "typescript";
import { RuleFailure } from "./language/rule/rule";

const includeMap = new Map<string, ts.TextRange[]>();

(function init() {
    const result = execSync("git --no-pager diff -U0 origin/master");
    console.log(result.toString('utf8')); //tslint:disable-line
})();

export function removeIrreleventFailures(sourceFile: ts.SourceFile, failures: RuleFailure[]): RuleFailure[] {
    if (failures.length === 0) {
        // Usually there won't be failures anyway, so no need to look for "tslint:disable".
        return failures;
    }
    const includedIntervals = includeMap.get(sourceFile.fileName);
    if (includedIntervals === undefined || includedIntervals.length === 0) {
        return [];
    }

    return failures.filter((failure) =>
        includedIntervals.some(({ pos, end }) => {
            const failPos = failure.getStartPosition().getPosition();
            const failEnd = failure.getEndPosition().getPosition();
            return failEnd >= pos && (end === -1 || failPos < end);
        }));
}
