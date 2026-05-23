import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { zoom } from 'd3-zoom';
import characters from '../data/characters.json';
import {
  categorize,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../data/relationshipCategories';

const CATEGORY_PRIORITY = ['family', 'rivalry', 'discipleship', 'friendship'];
const NODE_RADIUS = 9;
const FOCUS_RADIUS = 16;

function buildGraph(focusId) {
  const nodes = characters.map((c) => ({
    id: c.id,
    name: c.name,
    period: c.period,
    isFocus: c.id === focusId,
  }));

  const edgeMap = new Map();
  for (const c of characters) {
    for (const r of c.relationships || []) {
      const key = [c.id, r.characterId].sort().join('::');
      const cat = categorize(r.type);
      const existing = edgeMap.get(key);
      if (!existing) {
        edgeMap.set(key, {
          source: c.id,
          target: r.characterId,
          type: r.type,
          category: cat,
        });
      } else if (CATEGORY_PRIORITY.indexOf(cat) < CATEGORY_PRIORITY.indexOf(existing.category)) {
        existing.type = r.type;
        existing.category = cat;
      }
    }
  }

  return { nodes, links: Array.from(edgeMap.values()) };
}

function RelationshipsPage() {
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [graphReady, setGraphReady] = useState(false);

  useEffect(() => {
    setGraphReady(false);
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    const { nodes, links } = buildGraph(focusId);

    const neighborIds = new Set();
    if (focusId) {
      neighborIds.add(focusId);
      for (const link of links) {
        if (link.source === focusId) neighborIds.add(link.target);
        if (link.target === focusId) neighborIds.add(link.source);
      }
    }

    const svg = select(svgEl)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', '100%');
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'graph-zoom-layer');

    const zoomBehavior = zoom()
      .scaleExtent([0.4, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoomBehavior);

    const linkSel = g
      .append('g')
      .attr('class', 'graph-links')
      .attr('fill', 'none')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => CATEGORY_COLORS[d.category])
      .attr('stroke-width', (d) =>
        focusId && (d.source === focusId || d.target === focusId) ? 2.4 : 1.4
      )
      .attr('stroke-opacity', (d) =>
        !focusId
          ? 0.55
          : d.source === focusId || d.target === focusId
          ? 0.95
          : 0.18
      )
      .style('pointer-events', 'none');

    const nodeSel = g
      .append('g')
      .attr('class', 'graph-nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', (d) => `graph-node${d.isFocus ? ' graph-node--focused' : ''}`)
      .style('cursor', 'pointer')
      .style('opacity', (d) =>
        !focusId ? 1 : neighborIds.has(d.id) ? 1 : 0.3
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        navigate(`/characters/${d.id}`);
      })
      .on('mouseenter', (event, d) => {
        setHovered({
          id: d.id,
          name: d.name,
          period: d.period,
          x: event.clientX,
          y: event.clientY,
        });
      })
      .on('mousemove', (event) => {
        setHovered((prev) =>
          prev ? { ...prev, x: event.clientX, y: event.clientY } : prev
        );
      })
      .on('mouseleave', () => {
        setHovered(null);
      });

    nodeSel
      .append('circle')
      .attr('r', (d) => (d.isFocus ? FOCUS_RADIUS : NODE_RADIUS))
      .attr('fill', '#C9A84C')
      .attr('stroke', (d) => (d.isFocus ? '#F2F2F0' : '#0D1117'))
      .attr('stroke-width', (d) => (d.isFocus ? 3 : 2));

    nodeSel
      .filter((d) => d.isFocus)
      .insert('circle', 'circle')
      .attr('class', 'graph-node__halo')
      .attr('r', FOCUS_RADIUS + 8)
      .attr('fill', 'none')
      .attr('stroke', '#C9A84C')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.4);

    nodeSel
      .append('text')
      .attr('class', 'graph-node-label')
      .attr('text-anchor', 'middle')
      .attr('y', (d) => (d.isFocus ? FOCUS_RADIUS + 16 : NODE_RADIUS + 14))
      .attr('fill', (d) => (d.isFocus ? '#F2F2F0' : '#A8AEB8'))
      .attr('font-size', (d) => (d.isFocus ? '0.85rem' : '0.75rem'))
      .attr('font-family', "'Inter', sans-serif")
      .attr('font-weight', (d) => (d.isFocus ? 600 : 500))
      .style('paint-order', 'stroke')
      .style('stroke', '#0D1117')
      .style('stroke-width', 3)
      .text((d) => d.name);

    let settled = false;
    const simulation = forceSimulation(nodes)
      .alphaDecay(0.045)
      .velocityDecay(0.45)
      .force(
        'link',
        forceLink(links)
          .id((d) => d.id)
          .distance(90)
          .strength(0.6)
      )
      .force('charge', forceManyBody().strength(-260))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide().radius(34))
      .on('tick', () => {
        linkSel
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);
        nodeSel.attr('transform', (d) => `translate(${d.x},${d.y})`);
        if (!settled && simulation.alpha() < 0.05) {
          settled = true;
          setGraphReady(true);
        }
      })
      .on('end', () => {
        if (!settled) {
          settled = true;
          setGraphReady(true);
        }
      });

    if (focusId) {
      const focusNode = nodes.find((n) => n.id === focusId);
      if (focusNode) {
        focusNode.fx = width / 2;
        focusNode.fy = height / 2;
      }
    }

    nodeSel.call(
      drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          if (!d.isFocus) {
            d.fx = null;
            d.fy = null;
          }
        })
    );

    return () => {
      simulation.stop();
      svg.selectAll('*').remove();
    };
  }, [focusId, navigate]);

  const focusCharacter = focusId
    ? characters.find((c) => c.id === focusId)
    : null;

  return (
    <section className="page relationships-page">
      <Helmet>
        <title>Network — Selah</title>
        <meta name="description" content="A force graph of biblical relationships — family, friendship, discipleship, and rivalry across 100 characters." />
        <meta property="og:title" content="Network — Selah" />
        <meta property="og:description" content="A force graph of biblical relationships — family, friendship, discipleship, and rivalry across 100 characters." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Network — Selah" />
        <meta name="twitter:description" content="A force graph of biblical relationships — family, friendship, discipleship, and rivalry across 100 characters." />
      </Helmet>
      <div className="page__inner relationships-page__inner">
        <header className="page__header">
          <span className="page__eyebrow">Network</span>
          <h1 className="page__title">Relationships</h1>
          <p className="page__lede">
            The web of biblical lives — family, friendship, discipleship, and
            rivalry. Drag a node to rearrange the network, scroll to zoom, and
            click any name to read the profile.
          </p>
          {focusCharacter && (
            <p className="relationships-page__focus">
              <span className="relationships-page__focus-label">Centered on</span>
              <strong>{focusCharacter.name}</strong>
            </p>
          )}
        </header>

        <ul className="graph-legend">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <li key={key} className="graph-legend__item">
              <span
                className="graph-legend__line"
                style={{ backgroundColor: CATEGORY_COLORS[key] }}
                aria-hidden="true"
              />
              {label}
            </li>
          ))}
        </ul>

        <p className="graph-mobile-notice" role="note">
          Best viewed on desktop — pinch to zoom and drag to pan on touch
          devices.
        </p>

        <div className="graph-container" ref={containerRef}>
          <svg ref={svgRef} className="graph-svg" />
          <div
            className={`graph-loading${graphReady ? ' graph-loading--hidden' : ''}`}
            aria-hidden={graphReady}
          >
            <div className="graph-loading__pulse" />
            <span>Drawing the network…</span>
          </div>
          {hovered && (
            <div
              className="graph-tooltip"
              style={{
                left: hovered.x + 14,
                top: hovered.y + 14,
              }}
            >
              <strong>{hovered.name}</strong>
              <span>{hovered.period}</span>
            </div>
          )}
        </div>

        <p className="graph-hint">
          Tip: scroll to zoom, drag the canvas to pan, drag a node to rearrange.
        </p>
      </div>
    </section>
  );
}

export default RelationshipsPage;
