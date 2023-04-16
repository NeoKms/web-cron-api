/* DO NOT EDIT, file generated by nestjs-i18n */

import { Path } from "nestjs-i18n";
export type I18nTranslations = {
    "auth": {
        "time": {
            "hour": string;
            "day": string;
        };
        "errors": {
            "wrong_login_or_password": string;
            "ban_login": string;
            "send_code_retry": string;
            "code_error": string;
        };
    };
    "job": {
        "errors": {
            "not_found": string;
            "bad_req": string;
        };
    };
    "log": {
        "errors": {
            "not_found": string;
        };
    };
    "mailer": {
        "messages": {
            "ready": string;
        };
        "errors": {
            "not_ready": string;
            "cant_send": string;
            "cant_verify": string;
        };
        "email_templates": {
            "send_code": {
                "text": string;
                "subject": string;
            };
            "sign_up": {
                "text": string;
                "subject": string;
            };
        };
    };
    "main": {
        "messages": {
            "server_port": string;
            "incoming_req": string;
            "sentry": string;
        };
        "doc": {
            "title": string;
            "description": string;
        };
    };
    "ssh": {
        "errors": {
            "duplicate": string;
            "no_id": string;
            "not_found": string;
            "cannot_delete": string;
            "auth_ssh": string;
            "econnrefused": string;
            "notfound_remote": string;
        };
        "messages": {
            "start_all_servers": string;
            "need_add_count": string;
            "add_server_id": string;
            "delete_server_id": string;
            "cron_job_start": string;
            "cron_job_end": string;
        };
    };
    "user": {
        "errors": {
            "duplicate_phone": string;
            "bad_req": string;
            "not_found": string;
            "org_change": string;
            "duplicate_email": string;
        };
    };
};
export type I18nPath = Path<I18nTranslations>;
