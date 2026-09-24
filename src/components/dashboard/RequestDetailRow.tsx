interface RequestDetailRowProps {
  counterpartyName: string | null
  description: string | null
}

export function RequestDetailRow({ counterpartyName, description }: RequestDetailRowProps) {
  return (
    <tr className="dashboard-detail-row">
      <td colSpan={9}>
        <p>Counterparty: {counterpartyName ?? 'No counterparty provided.'}</p>
        <p className="dashboard-detail-warning">
          Reminder: this field must not contain personal data of data subjects — names,
          documents, contact details, or any other personal data.
        </p>
        <p>Description: {description ?? 'No description provided.'}</p>
      </td>
    </tr>
  )
}
