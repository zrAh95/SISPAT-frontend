type Props = {
  name: string
  label: string
  defaultValue?: string
}

const JAM = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const MENIT = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))

// TimeField memakai dropdown jam 00-23 supaya tidak muncul AM/PM
// dan tidak bergantung pada locale browser.
export function TimeField({ name, label, defaultValue = '19:00' }: Props) {
  const [jam, menit] = defaultValue.split(':')
  return (
    <label>
      {label}
      <span className="time-field">
        <select name={`${name}_jam`} defaultValue={jam} aria-label={`${label} jam`}>
          {JAM.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <span className="time-separator">:</span>
        <select name={`${name}_menit`} defaultValue={MENIT.includes(menit) ? menit : '00'} aria-label={`${label} menit`}>
          {MENIT.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </span>
    </label>
  )
}
