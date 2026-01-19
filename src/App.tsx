import { useEffect, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import type { Artwork, ApiResponse } from './type'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber'
import './App.css'
import axios from 'axios'

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set()); // stroes only artword.id not entire row
  const overlayRef = useRef<OverlayPanel>(null);
  const [selectCount, setSelectCount] = useState<number | null> (null);
  const [pendingSelectCount, setPendingSelectCount] = useState<number>(0);

  const fetchArtworks = async (page: number) => {
    try {
      const res = await axios.get<ApiResponse>(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data = res.data;
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    }
    catch (err) {
      console.error("Error while fetching artworks: ", err);
    }
  }

  const selectedArtworks = artworks.filter(art =>
    selectedRowIds.has(art.id)
  );

  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  useEffect(() => {
    if(pendingSelectCount > 0) {
      const newSelected = new Set(selectedRowIds);
      const toSelectNow = Math.min(pendingSelectCount, artworks.length);

      artworks.slice(0, toSelectNow).forEach(art => newSelected.add(art.id));
      setSelectedRowIds(newSelected);

      setPendingSelectCount(prev => Math.max(0, prev - toSelectNow));
    }
  }, [artworks]);

  return (
    <div className='App'>
      <h1>Art Institute of Chicago - Artworks</h1>
      <Button 
      label="Custom Select"
      icon="pi pi-check-square"
      onClick={(e) => overlayRef.current?.toggle(e)}
      />
  <OverlayPanel ref={overlayRef} showCloseIcon>
  <div style={{ display: 'flex', flexDirection: 'column', gap:'0.5rem' }}>
    <InputNumber
      value={selectCount}
      onValueChange={(e) => setSelectCount(e.value ?? null)}
      placeholder="Enter number of rows"
      min={1}
      max={totalRecords}
    />
    <Button
      label="Select Rows"
      icon="pi pi-check"
      onClick={() => {
        if(!selectCount || selectCount <= 0) return;

        const newSelected = new Set(selectedRowIds);
        const available = artworks.length;
        // select rows on current page
        artworks.slice(0,selectCount).forEach(art => newSelected.add(art.id));
        setSelectedRowIds(newSelected);

        if(selectCount > available) {
          setPendingSelectCount(selectCount - available);
        }else {
          setPendingSelectCount(0);
        }
        overlayRef.current?.hide();
        setSelectCount(null);
      }}
    />
  </div>
</OverlayPanel>

      <DataTable
        value={artworks}
        paginator
        lazy
        rows={12}
        totalRecords={totalRecords}
        first={(page - 1) * 12}
        onPage={(e) => setPage((e.page ?? 0) + 1)}
        selection={selectedArtworks}
        selectionMode="checkbox"
        dataKey="id"
        onSelectionChange={(e) => {
          const newSelected = new Set(selectedRowIds);
          const currentPageIds = new Set(artworks.map(a => a.id));

          //clear current page selections
          currentPageIds.forEach(id => newSelected.delete(id));

          // add newly selected rows from current page
          const selected = e.value as Artwork[] | null;

          if (selected) {
            selected.forEach(art => {
              newSelected.add(art.id);
            });
          }

          setSelectedRowIds(newSelected);
        }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header="TITLE" />
        <Column field="place_of_origin" header="PLACE OF ORIGIN" />
        <Column field="artist_display" header="ARTIST" />
        <Column field="inscriptions" header="INSCRIPTIONS" />
        <Column field="date_start" header="START DATE" />
        <Column field="date_end" header="END DATE" />
      </DataTable>
    </div>
  )
}

export default App
