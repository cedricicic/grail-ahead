import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RadarChart = ({ pricePercentile, likesPercentile, photosPercentile }) => {
  const radarChartRef = useRef(null);

  useEffect(() => {
    if (radarChartRef.current) {
      createRadarChart(radarChartRef.current, pricePercentile, likesPercentile, photosPercentile);
    }
  }, [pricePercentile, likesPercentile, photosPercentile]);

  return (
    <>        <h2>Radar Chart</h2>
        <div
      id="radarChart"
      ref={radarChartRef}
      style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
    ></div>
    </>

  );
};

const createRadarChart = (target, pricePercentile, likesPercentile, photosPercentile) => {
  // Clear previous content
  target.innerHTML = '';

  // Base dimensions for the chart
  const width = 300;
  const height = 300;
  const extraMargin = 40; // Extra space for labels
  const radius = Math.min(width, height) / 2 - 40;
  const centerX = width / 2;
  const centerY = height / 2;

  // Create scalable SVG using viewBox with extra margin
  const svg = d3.select(target)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    // Expand the viewBox to give extra room for text
    .attr('viewBox', `-${extraMargin} -${extraMargin} ${width + extraMargin * 2} ${height + extraMargin * 2}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Create tooltip for interactivity
  const tooltip = d3.select('body').append('div')
    .attr('class', 'radar-tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.7)')
    .style('color', 'white')
    .style('padding', '6px')
    .style('border-radius', '3px')
    .style('font-size', '10px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000);

  // Define metrics with provided percentiles
  const metrics = [
    { name: 'Price Competitiveness', value: 100 - parseFloat(pricePercentile) },
    { name: 'Likeability', value: parseFloat(likesPercentile) },
    { name: 'Label Effectiveness', value: 65 },
    { name: 'Photos Appeal', value: parseFloat(photosPercentile) }
  ];

  const angleSlice = (Math.PI * 2) / metrics.length;

  // Draw concentric circles and percentage labels
  [0.2, 0.4, 0.6, 0.8, 1].forEach(r => {
    svg.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius * r)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5);

    svg.append('text')
      .attr('x', centerX)
      .attr('y', centerY - radius * r)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '8px')
      .attr('fill', '#333')
      .text(`${r * 100}%`);
  });

  // Draw axis lines and labels for each metric
  metrics.forEach((d, i) => {
    const angle = i * angleSlice - Math.PI / 2;
    const lineEnd = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };

    // Axis line
    svg.append('line')
      .attr('x1', centerX)
      .attr('y1', centerY)
      .attr('x2', lineEnd.x)
      .attr('y2', lineEnd.y)
      .attr('stroke', '#bbb')
      .attr('stroke-width', 0.5);

    // Position labels slightly outside the radar area
    const labelDistance = radius + 15;
    const labelX = centerX + labelDistance * Math.cos(angle);
    const labelY = centerY + labelDistance * Math.sin(angle);

    svg.append('text')
      .attr('x', labelX)
      .attr('y', labelY)
      .attr('text-anchor', () => {
        if (angle === -Math.PI / 2) return 'middle';
        if (angle < Math.PI / 2 && angle > -Math.PI / 2) return 'start';
        return 'end';
      })
      .attr('alignment-baseline', () => {
        if (angle === Math.PI / 2 || angle === -Math.PI / 2) return 'middle';
        if (angle < 0) return 'baseline';
        return 'hanging';
      })
      .attr('font-size', '9px')
      .attr('fill', 'black')
      .text(d.name);
  });

  // Calculate radar points for the data
  const radarPoints = metrics.map((d, i) => {
    const angle = i * angleSlice - Math.PI / 2;
    return {
      x: centerX + (d.value / 150) * radius * Math.cos(angle),
      y: centerY + (d.value / 150) * radius * Math.sin(angle),
      value: d.value,
      name: d.name
    };
  });

  // Draw the radar polygon
  const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinearClosed);

  svg.append('path')
    .datum(radarPoints)
    .attr('d', lineGenerator)
    .attr('fill', 'rgba(0, 0, 0, 0.1)')
    .attr('stroke', 'black')
    .attr('stroke-width', 1.5);

  // Add circles at each radar point with tooltip functionality
  radarPoints.forEach(d => {
    svg.append('circle')
      .attr('cx', d.x)
      .attr('cy', d.y)
      .attr('r', 4)
      .attr('fill', 'black')
      .on('mouseover', function(event) {
        tooltip.style('opacity', 1)
          .html(`${d.name}: ${d.value.toFixed(1)}%`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', function() {
        tooltip.style('opacity', 0);
      });
  });

};

export default RadarChart;