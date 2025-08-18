import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input(props: Props) {
  return <input {...props} className={["block w-full rounded-md border px-3 py-2 text-sm", props.className || ''].join(' ')} />
}
