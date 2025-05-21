import React, { useState, useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DataTable = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpanded = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const columns = useMemo(
    () => [
      {
        Header: 'MRO Şirketi',
        accessor: 'mro_company',
        Cell: ({ value }) => (
          <div className="font-medium text-gray-900">{value}</div>
        ),
      },
      {
        Header: 'Operatör',
        accessor: 'airline',
        Cell: ({ value }) => (
          <div className="font-medium text-gray-900">{value}</div>
        ),
      },
      {
        Header: 'Uçak Modelleri',
        accessor: 'aircraft_models',
        Cell: ({ value, row }) => {
          const isExpanded = expandedRows[row.id] || false;
          const displayValue = value || 'N/A';
          const models = displayValue.split(',').map(model => model.trim());
          
          if (models.length <= 2 || isExpanded) {
            return (
              <div>
                {models.map((model, idx) => (
                  <div key={idx} className="text-sm text-gray-500">{model}</div>
                ))}
                {models.length > 2 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpanded(row.id);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-800 mt-1"
                  >
                    {isExpanded ? 'Daha az göster' : 'Daha fazla göster'}
                  </button>
                )}
              </div>
            );
          } else {
            return (
              <div>
                <div className="text-sm text-gray-500">{models[0]}</div>
                <div className="text-sm text-gray-500">{models[1]}</div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowExpanded(row.id);
                  }}
                  className="text-xs text-primary-600 hover:text-primary-800 mt-1"
                >
                  +{models.length - 2} daha
                </button>
              </div>
            );
          }
        },
      },
      {
        Header: 'Uçak Sayısı',
        accessor: 'aircraft_count',
        Cell: ({ value }) => (
          <div className="text-sm text-gray-500">{value !== 'n/a' ? value : 'N/A'}</div>
        ),
      },
      {
        Header: 'Servis Tipi',
        accessor: 'service_type',
        Cell: ({ value, row }) => {
          const isExpanded = expandedRows[row.id] || false;
          const displayValue = value || 'N/A';
          const services = displayValue.split(',').map(service => service.trim());
          
          if (services.length <= 2 || isExpanded) {
            return (
              <div>
                {services.map((service, idx) => (
                  <div key={idx} className="text-sm text-gray-500">{service}</div>
                ))}
                {services.length > 2 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpanded(row.id);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-800 mt-1"
                  >
                    {isExpanded ? 'Daha az göster' : 'Daha fazla göster'}
                  </button>
                )}
              </div>
            );
          } else {
            return (
              <div>
                <div className="text-sm text-gray-500">{services[0]}</div>
                <div className="text-sm text-gray-500">{services[1]}</div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowExpanded(row.id);
                  }}
                  className="text-xs text-primary-600 hover:text-primary-800 mt-1"
                >
                  +{services.length - 2} daha
                </button>
              </div>
            );
          }
        },
      },
      {
        Header: 'Anlaşma Tarihi',
        accessor: 'agreement_date',
        Cell: ({ value }) => {
          const date = value !== 'n/a' ? value : 'N/A';
          let badgeClass = 'badge-gray';
          
          if (date !== 'N/A') {
            const year = parseInt(date.substring(0, 4));
            const currentYear = new Date().getFullYear();
            
            if (year === currentYear) {
              badgeClass = 'badge-green';
            } else if (year > currentYear) {
              badgeClass = 'badge-blue';
            } else if (year === currentYear - 1) {
              badgeClass = 'badge-yellow';
            } else {
              badgeClass = 'badge-gray';
            }
          }
          
          return (
            <div>
              <span className={`badge ${badgeClass}`}>{date}</span>
            </div>
          );
        },
      },
    ],
    [expandedRows]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div className="card">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-gray-900">Bakım Kayıtları</h2>
          <p className="mt-2 text-sm text-gray-700">
            Sistemdeki tüm bakım anlaşmalarının eksiksiz bir listesi.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {column.render('Header')}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FaSortDown className="ml-1 w-3 h-3" />
                          ) : (
                            <FaSortUp className="ml-1 w-3 h-3" />
                          )
                        ) : (
                          <FaSort className="ml-1 w-3 h-3 opacity-40" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {page.map(row => {
              prepareRow(row);
              return (
                <tr 
                  {...row.getRowProps()}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="py-3 flex items-center justify-between border-t border-gray-200 bg-white mt-4">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className={`btn btn-secondary ${!canPreviousPage && 'opacity-50 cursor-not-allowed'}`}
          >
            Önceki
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className={`btn btn-secondary ${!canNextPage && 'opacity-50 cursor-not-allowed'}`}
          >
            Sonraki
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{page.length === 0 ? 0 : pageIndex * pageSize + 1}</span> ile{' '}
              <span className="font-medium">
                {Math.min((pageIndex + 1) * pageSize, data.length)}
              </span>{' '}
              arası gösteriliyor, toplam <span className="font-medium">{data.length}</span> sonuç
            </p>
            <div className="ml-4">
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                }}
                className="mr-2 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} göster
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Sayfalama">
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  !canPreviousPage && 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="sr-only">Önceki</span>
                <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              
              {[...Array(Math.min(5, pageCount)).keys()].map(num => {
                let pageNum = num;
                if (pageCount > 5) {
                  if (pageIndex < 3) {
                    pageNum = num;
                  } else if (pageIndex > pageCount - 3) {
                    pageNum = pageCount - 5 + num;
                  } else {
                    pageNum = pageIndex - 2 + num;
                  }
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => gotoPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageIndex === pageNum
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  !canNextPage && 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="sr-only">Sonraki</span>
                <FaChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;