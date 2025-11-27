import { jsx as _jsx } from "react/jsx-runtime";
export default function Input(props) {
    return _jsx("input", { ...props, className: ["block w-full rounded-md border px-3 py-2 text-sm", props.className || ''].join(' ') });
}
