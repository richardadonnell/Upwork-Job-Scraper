import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button(props: Props) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
        'bg-sky-600 text-white hover:bg-sky-500 focus:outline-none',
        props.className || ''
      ].join(' ')}
    />
  )
}
