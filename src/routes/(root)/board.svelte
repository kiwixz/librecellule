<script lang="ts">
  import Card from '$lib/card.svelte'

  let props = $props()
</script>

<div class="">
  <div class="flex">
    <div class="flex p-[2%] gap-[1%]">
      {#each props.cards.depots as card, i (i)}
        <Card {...card} />
      {/each}
    </div>

    <div class="flex p-[2%] gap-[1%]">
      {#each props.cards.foundations as card, i (i)}
        <Card {...card} />
      {/each}
    </div>
  </div>

  <div class="flex p-[2%] gap-[1%]">
    {#each props.cards.tableau as pile, i (i)}
      <div class="grid *:row-1 *:col-1">
        {#each pile as card, i (i)}
          <div style="margin-top: {i * 40}%" draggable="true">
            <Card {...card} />
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
