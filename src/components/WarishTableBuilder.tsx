import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { TableConfig } from '../types';
import { toBengaliNumeral } from '../lib/utils';
import { sanitizeInput } from '../utils/security';

interface WarishTableBuilderProps {
  tableConfig: TableConfig;
  rowsData: string[][];
  onChangeRows: (newRows: string[][]) => void;
}

export const WarishTableBuilder: React.FC<WarishTableBuilderProps> = ({
  tableConfig,
  rowsData,
  onChangeRows,
}) => {
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const sanitizedVal = sanitizeInput(value, 500);
    const updated = rowsData.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const newRow = [...row];
        newRow[colIndex] = sanitizedVal;
        return newRow;
      }
      return row;
    });
    onChangeRows(updated);
  };

  const handleAddRow = () => {
    const emptyRow = tableConfig.headers.map((_, idx) => (idx === 0 ? toBengaliNumeral(rowsData.length + 1) : ''));
    onChangeRows([...rowsData, emptyRow]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    const updated = rowsData.filter((_, idx) => idx !== rowIndex).map((row, idx) => {
      // Re-index serial number in column 0
      const newRow = [...row];
      newRow[0] = toBengaliNumeral(idx + 1);
      return newRow;
    });
    onChangeRows(updated);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <Users className="w-4 h-4 text-emerald-700" />
          <span>{tableConfig.title} ({toBengaliNumeral(rowsData.length)} জন)</span>
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>নতুন সারি যোগ করুন</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-xs text-left text-slate-800">
          <thead className="bg-emerald-800 text-white font-semibold">
            <tr>
              {tableConfig.headers.map((header, idx) => (
                <th key={idx} className="p-2.5 border-r border-emerald-700 last:border-r-0 whitespace-nowrap">
                  {header}
                </th>
              ))}
              <th className="p-2.5 text-center w-12">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rowsData.length === 0 ? (
              <tr>
                <td colSpan={tableConfig.headers.length + 1} className="text-center py-4 text-slate-400">
                  কোনো সদস্য যোগ করা হয় নাই। ওপরের '+ নতুন সারি যোগ করুন' বাটনে ক্লিক করুন।
                </td>
              </tr>
            ) : (
              rowsData.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-emerald-50/40 transition">
                  {tableConfig.headers.map((_, cIdx) => (
                    <td key={cIdx} className="p-1.5 border-r border-slate-200 last:border-r-0">
                      <input
                        type="text"
                        value={row[cIdx] || ''}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        placeholder={tableConfig.headers[cIdx]}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-emerald-600 focus:outline-none text-xs"
                      />
                    </td>
                  ))}
                  <td className="p-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rIdx)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
