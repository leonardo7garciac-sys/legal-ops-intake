interface RequestDetailRowProps {
  description: string | null
}

export function RequestDetailRow({ description }: RequestDetailRowProps) {
  return (
    <tr className="dashboard-detail-row">
      <td colSpan={9}>
        <p className="dashboard-detail-warning">
          Reminder: this field must not contain personal data of data subjects — names,
          documents, contact details, or any other personal data.
        </p>
        <p>{description ?? 'No description provided.'}</p>
      </td>
    </tr>
  )
}
