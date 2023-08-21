import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin, relative as pathRelative } from "path";
import type { ThemeType } from "../generateFtl";
import { downloadBuiltinKeycloakTheme } from "../../download-builtin-keycloak-theme";
import {
    resourcesCommonDirPathRelativeToPublicDir,
    resourcesDirPathRelativeToPublicDir,
    basenameOfKeycloakDirInPublicDir
} from "../../mockTestingResourcesPath";
import * as crypto from "crypto";

export async function downloadKeycloakStaticResources(
    // prettier-ignore
    params: {
        projectDirPath: string;
        themeType: ThemeType;
        themeDirPath: string;
        keycloakVersion: string;
    }
) {
    const { projectDirPath, themeType, themeDirPath, keycloakVersion } = params;

    const tmpDirPath = pathJoin(
        themeDirPath,
        "..",
        `tmp_suLeKsxId_${crypto.createHash("sha256").update(`${themeType}-${keycloakVersion}`).digest("hex").slice(0, 8)}`
    );

    await downloadBuiltinKeycloakTheme({
        projectDirPath,
        keycloakVersion,
        "destDirPath": tmpDirPath
    });

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", themeType, "resources"),
        "destDirPath": pathJoin(themeDirPath, pathRelative(basenameOfKeycloakDirInPublicDir, resourcesDirPathRelativeToPublicDir))
    });

    transformCodebase({
        "srcDirPath": pathJoin(tmpDirPath, "keycloak", "common", "resources"),
        "destDirPath": pathJoin(themeDirPath, pathRelative(basenameOfKeycloakDirInPublicDir, resourcesCommonDirPathRelativeToPublicDir))
    });

    fs.rmSync(tmpDirPath, { "recursive": true, "force": true });
}
