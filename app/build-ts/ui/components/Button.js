import { jsx as _jsx } from "react/jsx-runtime";
export default function Button(props) {
    return (_jsx("button", { ...props, className: [
            'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
            'bg-sky-600 text-white hover:bg-sky-500 focus:outline-none',
            props.className || ''
        ].join(' ') }));
}
