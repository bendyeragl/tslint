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

let includeMap: Map<string, ts.TextRange[]>;
const outFileNameRegex = /^\+\+\+ b(.*)$/m;
const changeRegex = /^@@ \-\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/mg;

(function init() {
    const cwd = process.cwd();
    const result = execSync("git --no-pager diff -U0 master", {encoding: "utf8"});
    const gitOutputByFile = splitGitOutputByFile(result);
    const filtered = gitOutputByFile.filter((x) => x !== "");
    const mapToBlob =  filtered.map(toFileNameMap)
        .filter((x) => x !== null)
        .map<[string, string]>((x) => x as [string, string]);
    includeMap = mapToBlob.map(toChanges).reduce(
        (accumulator: Map<string, ts.TextRange[]>, currentValue: [string, ts.TextRange[]]) => {
            accumulator.set(cwd + currentValue[0], currentValue[1]);
            return accumulator;
        },
        new Map<string, ts.TextRange[]>());
})();

function splitGitOutputByFile(input: string): string[] {
    return input.split(/^diff --git a\/.* b\/.*$/m);
}

function toFileNameMap(fileBlob: string): [string, string] | null {
    const outFileNameMatches = outFileNameRegex.exec(fileBlob);
    if (outFileNameMatches === null) { return null; }
    return [outFileNameMatches[1], fileBlob];
}

function toChanges(input: [string, string]): [string, ts.TextRange[]] {
    let arr;
    const range: ts.TextRange[] = [];
    while ((arr = changeRegex.exec(input[1])) !== null) { // tslint:disable-line
        const len = arr[2] === undefined ? 1 : parseInt(arr[2], 10);
        const pos = parseInt(arr[1], 10) - 1;
        if (len > 0) {
            const end = pos + len - 1;
            range.push({pos, end});
        }
    }
    return [input[0], range];
}

export function removeIrreleventFailures(sourceFile: ts.SourceFile, failures: RuleFailure[]): RuleFailure[] {
    if (failures.length === 0) {
        // Usually there won't be failures anyway, so no need to look for "tslint:disable".
        return failures;
    }
    const includedIntervals = includeMap.get(sourceFile.fileName);
    if (includedIntervals === undefined || includedIntervals.length === 0) {
        return [];
    }

    return failures.filter((failure) => {
        const failPos = failure.getStartPosition().getLineAndCharacter().line;
        const failEnd = failure.getEndPosition().getLineAndCharacter().line;

        return includedIntervals.some(({ pos, end }) => failEnd >= pos &&  failPos <= end);
    });
}
