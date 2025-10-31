import { usePage } from "@inertiajs/react";

export default function CheckRoles({
    roles = [],
    notRoles = [],
    anotherValidation = true,
    children = null,
    elseChildren = null,
}) {
    const { loggedrole } = usePage().props;

    const hasRequiredRole = () => {
        if (!Array.isArray(roles) || roles.length === 0) return true;
        return roles.some((role) => loggedrole?.includes(role));
    };

    const hasNoForbiddenRole = () => {
        if (!Array.isArray(notRoles) || notRoles.length === 0) return true;
        return !notRoles.some((role) => loggedrole?.includes(role));
    };
    const isAuthorized =
        hasRequiredRole() && hasNoForbiddenRole() && anotherValidation;

    return isAuthorized ? children : elseChildren;
}
